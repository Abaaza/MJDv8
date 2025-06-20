-- User Management System Migration
-- Creates tables and policies for authentication verification and role-based access control

-- 1. Create user_roles table
CREATE TABLE IF NOT EXISTS user_roles (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  permissions JSONB DEFAULT '{}',
  is_system_role BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default roles
INSERT INTO user_roles (name, description, permissions, is_system_role) VALUES
('admin', 'Full system access with user management capabilities', 
 '{"users": ["read", "write", "delete"], "settings": ["read", "write"], "jobs": ["read", "write", "delete"], "clients": ["read", "write", "delete"], "prices": ["read", "write", "delete"]}', 
 true),
('manager', 'Manage projects and view reports', 
 '{"users": ["read"], "settings": ["read"], "jobs": ["read", "write"], "clients": ["read", "write"], "prices": ["read", "write"]}', 
 true),
('user', 'Basic user access for project work', 
 '{"jobs": ["read", "write"], "clients": ["read"], "prices": ["read"]}', 
 true),
('viewer', 'Read-only access for viewing data', 
 '{"jobs": ["read"], "clients": ["read"], "prices": ["read"]}', 
 true)
ON CONFLICT (name) DO NOTHING;

-- 2. Create access_requests table for user registration approval
CREATE TABLE IF NOT EXISTS access_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  company VARCHAR(255),
  phone VARCHAR(50),
  message TEXT,
  requested_role VARCHAR(50) DEFAULT 'user',
  status VARCHAR(20) DEFAULT 'pending', -- pending, approved, rejected
  admin_notes TEXT,
  approved_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days')
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_access_requests_status ON access_requests(status);
CREATE INDEX IF NOT EXISTS idx_access_requests_email ON access_requests(email);

-- 3. Create user_sessions table for session management
CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_token VARCHAR(255) NOT NULL,
  ip_address INET,
  user_agent TEXT,
  is_active BOOLEAN DEFAULT true,
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '30 days')
);

CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_active ON user_sessions(is_active);

-- 4. Create audit_logs table for security monitoring
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  action VARCHAR(100) NOT NULL,
  table_name VARCHAR(100),
  record_id VARCHAR(255),
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

-- 5. Update profiles table with security features
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active',
ADD COLUMN IF NOT EXISTS last_login TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS failed_login_attempts INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS account_locked_until TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS two_factor_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE;

-- 6. Create functions and triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for timestamp updates
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_roles_updated_at ON user_roles;
CREATE TRIGGER update_user_roles_updated_at
  BEFORE UPDATE ON user_roles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_access_requests_updated_at ON access_requests;
CREATE TRIGGER update_access_requests_updated_at
  BEFORE UPDATE ON access_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 7. Function to log user actions
CREATE OR REPLACE FUNCTION log_user_action(
  p_action VARCHAR(100),
  p_table_name VARCHAR(100) DEFAULT NULL,
  p_record_id VARCHAR(255) DEFAULT NULL,
  p_old_values JSONB DEFAULT NULL,
  p_new_values JSONB DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO audit_logs (
    user_id, action, table_name, record_id, 
    old_values, new_values
  ) VALUES (
    auth.uid(), p_action, p_table_name, p_record_id,
    p_old_values, p_new_values
  ) RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Enable Row Level Security
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE access_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- 9. Create RLS Policies

-- User roles policies (admin only)
DROP POLICY IF EXISTS "Admin can manage user roles" ON user_roles;
CREATE POLICY "Admin can manage user roles" ON user_roles
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- Access requests policies
DROP POLICY IF EXISTS "Anyone can create access requests" ON access_requests;
CREATE POLICY "Anyone can create access requests" ON access_requests
FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admin can manage access requests" ON access_requests;
CREATE POLICY "Admin can manage access requests" ON access_requests
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- User sessions policies
DROP POLICY IF EXISTS "Users can view own sessions" ON user_sessions;
CREATE POLICY "Users can view own sessions" ON user_sessions
FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Admin can manage all sessions" ON user_sessions;
CREATE POLICY "Admin can manage all sessions" ON user_sessions
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- Audit logs policies (admin only)
DROP POLICY IF EXISTS "Admin can view audit logs" ON audit_logs;
CREATE POLICY "Admin can view audit logs" ON audit_logs
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- 10. Create helper functions for user management

-- Function to check if user has permission
CREATE OR REPLACE FUNCTION user_has_permission(
  p_user_id UUID,
  p_resource VARCHAR(50),
  p_action VARCHAR(50)
) RETURNS BOOLEAN AS $$
DECLARE
  user_role VARCHAR(50);
  role_permissions JSONB;
BEGIN
  -- Get user role
  SELECT role INTO user_role
  FROM profiles
  WHERE id = p_user_id;
  
  -- Admin has all permissions
  IF user_role = 'admin' THEN
    RETURN true;
  END IF;
  
  -- Get role permissions
  SELECT permissions INTO role_permissions
  FROM user_roles
  WHERE name = user_role;
  
  -- Check if user has permission
  RETURN (role_permissions->p_resource ? p_action);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to approve access request
CREATE OR REPLACE FUNCTION approve_access_request(
  p_request_id UUID,
  p_admin_notes TEXT DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
  request_email VARCHAR(255);
  request_name VARCHAR(255);
  request_role VARCHAR(50);
  new_user_id UUID;
BEGIN
  -- Check if current user is admin
  IF NOT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Only admins can approve access requests';
  END IF;
  
  -- Get request details
  SELECT email, full_name, requested_role
  INTO request_email, request_name, request_role
  FROM access_requests
  WHERE id = p_request_id AND status = 'pending';
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Access request not found or already processed';
  END IF;
  
  -- Update request status
  UPDATE access_requests
  SET 
    status = 'approved',
    admin_notes = p_admin_notes,
    approved_by = auth.uid(),
    updated_at = NOW()
  WHERE id = p_request_id;
  
  -- Log the action
  PERFORM log_user_action(
    'APPROVE_ACCESS_REQUEST',
    'access_requests',
    p_request_id::VARCHAR,
    NULL,
    jsonb_build_object('email', request_email, 'role', request_role)
  );
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 