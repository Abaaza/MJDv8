import express from 'express';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// Middleware to verify admin role
const requireAdmin = async (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '')
  
  if (!token) {
    return res.status(401).json({ error: 'No authorization token provided' })
  }
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser(token)
    
    if (error || !user) {
      return res.status(401).json({ error: 'Invalid token' })
    }
    
    // Check if user is admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    
    if (profileError || profile?.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' })
    }
    
    req.user = user
    next()
  } catch (error) {
    res.status(401).json({ error: 'Authentication failed' })
  }
}

// 1. Submit access request (public endpoint)
router.post('/access-request', async (req, res) => {
  try {
    const { email, full_name, company, phone, message, requested_role } = req.body
    
    // Validate required fields
    if (!email || !full_name) {
      return res.status(400).json({ error: 'Email and full name are required' })
    }
    
    // Check if request already exists
    const { data: existing, error: checkError } = await supabase
      .from('access_requests')
      .select('id')
      .eq('email', email)
      .eq('status', 'pending')
      .single()
    
    if (existing) {
      return res.status(409).json({ error: 'An access request for this email is already pending' })
    }
    
    // Create access request
    const { data, error } = await supabase
      .from('access_requests')
      .insert([{
        email: email.toLowerCase(),
        full_name,
        company,
        phone,
        message,
        requested_role: requested_role || 'user'
      }])
      .select()
      .single()
    
    if (error) {
      throw error
    }
    
    res.status(201).json({
      message: 'Access request submitted successfully',
      request_id: data.id
    })
    
  } catch (error) {
    console.error('Error submitting access request:', error)
    res.status(500).json({ error: 'Failed to submit access request' })
  }
})

// 2. Get all access requests (admin only)
router.get('/access-requests', requireAdmin, async (req, res) => {
  try {
    const { status } = req.query
    
    let query = supabase
      .from('access_requests')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (status) {
      query = query.eq('status', status)
    }
    
    const { data, error } = await query
    
    if (error) {
      throw error
    }
    
    res.json(data)
    
  } catch (error) {
    console.error('Error fetching access requests:', error)
    res.status(500).json({ error: 'Failed to fetch access requests' })
  }
})

// 3. Approve access request (admin only)
router.post('/access-requests/:id/approve', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params
    const { admin_notes, user_role } = req.body
    
    // Get request details
    const { data: request, error: requestError } = await supabase
      .from('access_requests')
      .select('*')
      .eq('id', id)
      .single()
    
    if (requestError || !request) {
      return res.status(404).json({ error: 'Access request not found' })
    }
    
    if (request.status !== 'pending') {
      return res.status(400).json({ error: 'Request has already been processed' })
    }
    
    // Create user account
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: request.email,
      password: Math.random().toString(36).slice(-12) + 'A1!', // Temporary password
      email_confirm: true,
      user_metadata: {
        full_name: request.full_name,
        company: request.company
      }
    })
    
    if (authError) {
      console.error('Error creating user:', authError)
      return res.status(500).json({ error: 'Failed to create user account' })
    }
    
    // Create profile
    const { error: profileError } = await supabase
      .from('profiles')
      .insert([{
        id: authData.user.id,
        name: request.full_name,
        role: user_role || request.requested_role,
        status: 'active',
        approved_by: req.user.id,
        approved_at: new Date().toISOString()
      }])
    
    if (profileError) {
      console.error('Error creating profile:', profileError)
      return res.status(500).json({ error: 'Failed to create user profile' })
    }
    
    // Update access request
    const { error: updateError } = await supabase
      .from('access_requests')
      .update({
        status: 'approved',
        admin_notes,
        approved_by: req.user.id
      })
      .eq('id', id)
    
    if (updateError) {
      console.error('Error updating request:', updateError)
    }
    
    // Log the action
    await supabase
      .from('audit_logs')
      .insert([{
        user_id: req.user.id,
        action: 'APPROVE_ACCESS_REQUEST',
        table_name: 'access_requests',
        record_id: id,
        new_values: {
          email: request.email,
          role: user_role || request.requested_role,
          created_user_id: authData.user.id
        }
      }])
    
    res.json({
      message: 'Access request approved successfully',
      user_id: authData.user.id,
      email: request.email
    })
    
  } catch (error) {
    console.error('Error approving access request:', error)
    res.status(500).json({ error: 'Failed to approve access request' })
  }
})

// 4. Reject access request (admin only)
router.post('/access-requests/:id/reject', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params
    const { admin_notes } = req.body
    
    const { error } = await supabase
      .from('access_requests')
      .update({
        status: 'rejected',
        admin_notes,
        approved_by: req.user.id
      })
      .eq('id', id)
    
    if (error) {
      throw error
    }
    
    // Log the action
    await supabase
      .from('audit_logs')
      .insert([{
        user_id: req.user.id,
        action: 'REJECT_ACCESS_REQUEST',
        table_name: 'access_requests',
        record_id: id,
        new_values: { admin_notes }
      }])
    
    res.json({ message: 'Access request rejected successfully' })
    
  } catch (error) {
    console.error('Error rejecting access request:', error)
    res.status(500).json({ error: 'Failed to reject access request' })
  }
})

// 5. Get all users (admin only)
router.get('/users', requireAdmin, async (req, res) => {
  try {
    const { role, status, page = 1, limit = 20 } = req.query
    
    let query = supabase
      .from('profiles')
      .select('id, name, role, status, last_login, failed_login_attempts, two_factor_enabled, created_at, updated_at')
      .order('created_at', { ascending: false })
    
    if (role) {
      query = query.eq('role', role)
    }
    
    if (status) {
      query = query.eq('status', status)
    }
    
    // Add pagination
    const offset = (page - 1) * limit
    query = query.range(offset, offset + limit - 1)
    
    const { data, error, count } = await query
    
    if (error) {
      throw error
    }
    
    res.json({
      users: data,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count
      }
    })
    
  } catch (error) {
    console.error('Error fetching users:', error)
    res.status(500).json({ error: 'Failed to fetch users' })
  }
})

// 6. Update user role (admin only)
router.put('/users/:id/role', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params
    const { role } = req.body
    
    // Get current user data
    const { data: currentUser, error: getCurrentError } = await supabase
      .from('profiles')
      .select('role, name')
      .eq('id', id)
      .single()
    
    if (getCurrentError || !currentUser) {
      return res.status(404).json({ error: 'User not found' })
    }
    
    // Update role
    const { error } = await supabase
      .from('profiles')
      .update({ role })
      .eq('id', id)
    
    if (error) {
      throw error
    }
    
    // Log the action
    await supabase
      .from('audit_logs')
      .insert([{
        user_id: req.user.id,
        action: 'UPDATE_USER_ROLE',
        table_name: 'profiles',
        record_id: id,
        old_values: { role: currentUser.role },
        new_values: { role }
      }])
    
    res.json({ message: 'User role updated successfully' })
    
  } catch (error) {
    console.error('Error updating user role:', error)
    res.status(500).json({ error: 'Failed to update user role' })
  }
})

// 7. Deactivate user (admin only)
router.put('/users/:id/deactivate', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params
    
    // Update user status
    const { error } = await supabase
      .from('profiles')
      .update({ status: 'inactive' })
      .eq('id', id)
    
    if (error) {
      throw error
    }
    
    // Revoke all user sessions
    const { error: sessionError } = await supabase
      .from('user_sessions')
      .update({ is_active: false })
      .eq('user_id', id)
    
    if (sessionError) {
      console.error('Error revoking sessions:', sessionError)
    }
    
    // Log the action
    await supabase
      .from('audit_logs')
      .insert([{
        user_id: req.user.id,
        action: 'DEACTIVATE_USER',
        table_name: 'profiles',
        record_id: id
      }])
    
    res.json({ message: 'User deactivated successfully' })
    
  } catch (error) {
    console.error('Error deactivating user:', error)
    res.status(500).json({ error: 'Failed to deactivate user' })
  }
})

// 8. Get user sessions (admin only)
router.get('/users/:id/sessions', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params
    
    const { data, error } = await supabase
      .from('user_sessions')
      .select('id, ip_address, user_agent, is_active, last_activity, created_at, expires_at')
      .eq('user_id', id)
      .order('last_activity', { ascending: false })
    
    if (error) {
      throw error
    }
    
    res.json(data)
    
  } catch (error) {
    console.error('Error fetching user sessions:', error)
    res.status(500).json({ error: 'Failed to fetch user sessions' })
  }
})

// 9. Get audit logs (admin only)
router.get('/audit-logs', requireAdmin, async (req, res) => {
  try {
    console.log('Audit logs endpoint called by user:', req.user?.id)
    const { user_id, action, page = 1, limit = 50 } = req.query
    
    let query = supabase
      .from('audit_logs')
      .select(`
        id, action, table_name, record_id, old_values, new_values, 
        ip_address, user_agent, created_at, user_id
      `)
      .order('created_at', { ascending: false })
    
    if (user_id) {
      query = query.eq('user_id', user_id)
    }
    
    if (action) {
      query = query.eq('action', action)
    }
    
    // Add pagination
    const offset = (page - 1) * limit
    query = query.range(offset, offset + limit - 1)
    
    console.log('Executing audit logs query...')
    const { data, error, count } = await query
    
    if (error) {
      console.error('Supabase error in audit logs:', error)
      throw error
    }
    
    console.log(`Found ${data?.length || 0} audit logs`)
    
    res.json({
      logs: data,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count
      }
    })
    
  } catch (error) {
    console.error('Error fetching audit logs:', error)
    console.error('Error details:', error.message, error.code)
    res.status(500).json({ error: 'Failed to fetch audit logs' })
  }
})

// 10. Get available roles (admin only)
router.get('/roles', requireAdmin, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('user_roles')
      .select('*')
      .order('name')
    
    if (error) {
      throw error
    }
    
    res.json(data)
    
  } catch (error) {
    console.error('Error fetching roles:', error)
    res.status(500).json({ error: 'Failed to fetch roles' })
  }
})

export default router; 