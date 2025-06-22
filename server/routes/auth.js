import express from 'express';
import UserMjd from '../models/UserMjd.js';
import { 
  generateAccessToken, 
  generateRefreshToken, 
  authenticate, 
  requireAdmin,
  createRateLimiter,
  refreshAccessToken 
} from '../middleware/auth.js';
import { nanoid } from 'nanoid';

const router = express.Router();

// Rate limiters removed for development
// const loginLimiter = createRateLimiter(15 * 60 * 1000, 5); // 5 attempts per 15 minutes
// const signupLimiter = createRateLimiter(60 * 60 * 1000, 3); // 3 signups per hour
// const resetLimiter = createRateLimiter(60 * 60 * 1000, 3); // 3 reset attempts per hour

// Helper function to create tokens and login response
const createLoginResponse = async (user) => {
  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);
  
  // Add refresh token to user
  await user.addRefreshToken(refreshToken);
  
  // Update last login
  user.lastLogin = new Date();
  await user.save();
  
  return {
    success: true,
    message: 'Login successful',
    user: user.toJSON(),
    accessToken,
    refreshToken
  };
};

// 1. User Registration (Request Access)
router.post('/register', async (req, res) => {
  try {
    const { email, password, name, company, phone, message } = req.body;

    // Validation
    if (!email || !password || !name) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'Email, password, and name are required'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'Password must be at least 6 characters long'
      });
    }

    // Check if user already exists
    const existingUser = await UserMjd.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({
        error: 'User exists',
        message: 'A user with this email already exists'
      });
    }

    // Create new user with pending status
    const user = new UserMjd({
      email: email.toLowerCase(),
      password,
      name,
      company,
      phone,
      status: 'pending',
      emailVerified: false, // We'll handle verification separately if needed
      accessRequest: {
        message,
        requestedRole: 'user'
      }
    });

    await user.save();

    res.status(201).json({
      success: true,
      message: 'Registration successful. Your account is pending admin approval.',
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        status: user.status
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    
    if (error.code === 11000) {
      return res.status(409).json({
        error: 'User exists',
        message: 'A user with this email already exists'
      });
    }

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        error: 'Validation failed',
        message: messages.join(', ')
      });
    }

    res.status(500).json({
      error: 'Server error',
      message: 'Registration failed'
    });
  }
});

// 2. User Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'Email and password are required'
      });
    }

    // Find user by email
    const user = await UserMjd.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      return res.status(401).json({
        error: 'Authentication failed',
        message: 'Invalid email or password'
      });
    }

    // Check if account is locked
    if (user.isLocked) {
      return res.status(423).json({
        error: 'Account locked',
        message: 'Account is temporarily locked due to failed login attempts'
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    
    if (!isPasswordValid) {
      // Increment failed attempts
      await user.incLoginAttempts();
      
      return res.status(401).json({
        error: 'Authentication failed',
        message: 'Invalid email or password'
      });
    }

    // Check account status
    if (user.status === 'pending') {
      return res.status(403).json({
        error: 'Account pending',
        message: 'Your account is pending admin approval'
      });
    }

    if (user.status === 'rejected') {
      return res.status(403).json({
        error: 'Account rejected',
        message: 'Your account access has been rejected'
      });
    }

    if (user.status === 'inactive') {
      return res.status(403).json({
        error: 'Account inactive',
        message: 'Your account has been deactivated'
      });
    }

    // Reset failed login attempts on successful login
    if (user.failedLoginAttempts > 0) {
      await user.resetLoginAttempts();
    }

    // Create login response
    const response = await createLoginResponse(user);
    res.json(response);

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Login failed'
    });
  }
});

// 3. Refresh Token
router.post('/refresh', refreshAccessToken);

// 4. Logout
router.post('/logout', authenticate, async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      // Remove the specific refresh token
      await req.user.removeRefreshToken(refreshToken);
    }

    res.json({
      success: true,
      message: 'Logout successful'
    });

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Logout failed'
    });
  }
});

// 5. Logout from all devices
router.post('/logout-all', authenticate, async (req, res) => {
  try {
    // Clear all refresh tokens
    req.user.refreshTokens = [];
    await req.user.save();

    res.json({
      success: true,
      message: 'Logged out from all devices'
    });

  } catch (error) {
    console.error('Logout all error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Logout failed'
    });
  }
});

// 6. Get current user profile
router.get('/me', authenticate, async (req, res) => {
  try {
    res.json({
      success: true,
      user: req.user.toJSON()
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to get user profile'
    });
  }
});

// 7. Update user profile
router.put('/me', authenticate, async (req, res) => {
  try {
    const { name, company, phone, preferences } = req.body;
    const user = req.user;

    // Update allowed fields
    if (name) user.name = name;
    if (company !== undefined) user.company = company;
    if (phone !== undefined) user.phone = phone;
    if (preferences) {
      if (preferences.theme) user.preferences.theme = preferences.theme;
      if (preferences.emailNotifications !== undefined) {
        user.preferences.emailNotifications = preferences.emailNotifications;
      }
      if (preferences.pushNotifications !== undefined) {
        user.preferences.pushNotifications = preferences.pushNotifications;
      }
    }

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: user.toJSON()
    });

  } catch (error) {
    console.error('Update profile error:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        error: 'Validation failed',
        message: messages.join(', ')
      });
    }

    res.status(500).json({
      error: 'Server error',
      message: 'Failed to update profile'
    });
  }
});

// 8. Change password
router.put('/change-password', authenticate, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'Current password and new password are required'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'New password must be at least 6 characters long'
      });
    }

    // Verify current password
    const user = await UserMjd.findById(req.user._id);
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);

    if (!isCurrentPasswordValid) {
      return res.status(401).json({
        error: 'Authentication failed',
        message: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword;
    
    // Clear all refresh tokens to force re-login
    user.refreshTokens = [];
    
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully. Please log in again.'
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to change password'
    });
  }
});

// 9. Request password reset
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'Email is required'
      });
    }

    const user = await UserMjd.findOne({ email: email.toLowerCase() });

    // Always return success to prevent email enumeration
    if (!user) {
      return res.json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent'
      });
    }

    // Generate reset token
    const resetToken = nanoid(32);
    user.passwordResetToken = resetToken;
    user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await user.save();

    // TODO: Send email with reset link
    // For now, just log it (in production, integrate with email service)
    console.log(`Password reset token for ${email}: ${resetToken}`);

    res.json({
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent'
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to process password reset request'
    });
  }
});

// 10. Reset password
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'Reset token and new password are required'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'New password must be at least 6 characters long'
      });
    }

    // Find user by reset token
    const user = await UserMjd.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({
        error: 'Invalid token',
        message: 'Password reset token is invalid or has expired'
      });
    }

    // Update password and clear reset token
    user.password = newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    
    // Clear all refresh tokens to force re-login
    user.refreshTokens = [];
    
    // Reset failed login attempts
    await user.resetLoginAttempts();

    await user.save();

    res.json({
      success: true,
      message: 'Password reset successful. Please log in with your new password.'
    });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to reset password'
    });
  }
});

// Admin Routes

// 11. Get pending access requests (Admin only)
router.get('/admin/access-requests', authenticate, requireAdmin, async (req, res) => {
  try {
    const { status = 'pending', page = 1, limit = 20 } = req.query;
    
    const skip = (page - 1) * limit;
    
    const users = await UserMjd.find({ status })
      .select('-password -refreshTokens')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await UserMjd.countDocuments({ status });

    res.json({
      success: true,
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get access requests error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to get access requests'
    });
  }
});

// 12. Approve user access (Admin only)
router.post('/admin/approve/:userId', authenticate, requireAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const { role = 'user', adminNotes } = req.body;

    const user = await UserMjd.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        message: 'User not found'
      });
    }

    if (user.status !== 'pending') {
      return res.status(400).json({
        error: 'Invalid status',
        message: 'User is not pending approval'
      });
    }

    // Update user status
    user.status = 'active';
    user.role = role;
    user.accessRequest.approvedBy = req.user._id;
    user.accessRequest.approvedAt = new Date();
    user.accessRequest.adminNotes = adminNotes;

    await user.save();

    res.json({
      success: true,
      message: 'User access approved successfully',
      user: user.toJSON()
    });

  } catch (error) {
    console.error('Approve user error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to approve user access'
    });
  }
});

// 13. Reject user access (Admin only)
router.post('/admin/reject/:userId', authenticate, requireAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const { adminNotes } = req.body;

    const user = await UserMjd.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        message: 'User not found'
      });
    }

    if (user.status !== 'pending') {
      return res.status(400).json({
        error: 'Invalid status',
        message: 'User is not pending approval'
      });
    }

    // Update user status
    user.status = 'rejected';
    user.accessRequest.rejectedBy = req.user._id;
    user.accessRequest.rejectedAt = new Date();
    user.accessRequest.adminNotes = adminNotes;

    await user.save();

    res.json({
      success: true,
      message: 'User access rejected',
      user: user.toJSON()
    });

  } catch (error) {
    console.error('Reject user error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to reject user access'
    });
  }
});

// 14. Get all users (Admin only)
router.get('/admin/users', authenticate, requireAdmin, async (req, res) => {
  try {
    const { status, role, page = 1, limit = 20 } = req.query;
    
    const filter = {};
    if (status) filter.status = status;
    if (role) filter.role = role;
    
    const skip = (page - 1) * limit;
    
    const users = await UserMjd.find(filter)
      .select('-password -refreshTokens')
      .populate('accessRequest.approvedBy', 'name email')
      .populate('accessRequest.rejectedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await UserMjd.countDocuments(filter);

    res.json({
      success: true,
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to get users'
    });
  }
});

// Admin: Get pending users
router.get('/admin/pending', authenticate, requireAdmin, async (req, res) => {
  try {
    const users = await UserMjd.find({ status: 'pending' })
      .select('-password -refreshTokens')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      users
    });
  } catch (error) {
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to get pending users'
    });
  }
});

// Admin: Approve user
router.post('/admin/approve/:userId', authenticate, requireAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const { role = 'user' } = req.body;

    const user = await UserMjd.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        message: 'User not found'
      });
    }

    user.status = 'active';
    user.role = role;
    user.accessRequest.approvedBy = req.user._id;
    user.accessRequest.approvedAt = new Date();

    await user.save();

    res.json({
      success: true,
      message: 'User approved successfully',
      user: user.toJSON()
    });

  } catch (error) {
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to approve user'
    });
  }
});

export default router; 