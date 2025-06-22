import jwt from 'jsonwebtoken';
import UserMjd from '../models/UserMjd.js';

// JWT configuration
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m'; // Short-lived access token
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d';

// Generate access token
export const generateAccessToken = (userId) => {
  return jwt.sign(
    { userId, type: 'access' },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
};

// Generate refresh token
export const generateRefreshToken = (userId) => {
  return jwt.sign(
    { userId, type: 'refresh' },
    JWT_SECRET,
    { expiresIn: REFRESH_TOKEN_EXPIRES_IN }
  );
};

// Verify token
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

// Authentication middleware
export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: 'Access denied', 
        message: 'No token provided' 
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    const decoded = verifyToken(token);

    if (!decoded || decoded.type !== 'access') {
      return res.status(401).json({ 
        error: 'Access denied', 
        message: 'Invalid or expired token' 
      });
    }

    // Get user from database
    const user = await UserMjd.findById(decoded.userId).select('-password -refreshTokens');
    
    if (!user) {
      return res.status(401).json({ 
        error: 'Access denied', 
        message: 'User not found' 
      });
    }

    // Check if user account is active
    if (user.status !== 'active') {
      return res.status(403).json({ 
        error: 'Account inactive', 
        message: 'Your account is not active. Please contact an administrator.' 
      });
    }

    // Check if account is locked
    if (user.isLocked) {
      return res.status(423).json({ 
        error: 'Account locked', 
        message: 'Account is temporarily locked due to failed login attempts.' 
      });
    }

    // Add user to request object
    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({ 
      error: 'Server error', 
      message: 'Authentication failed' 
    });
  }
};

// Admin authorization middleware
export const requireAdmin = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Access denied', 
        message: 'Authentication required' 
      });
    }

    if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        error: 'Access denied', 
        message: 'Admin access required' 
      });
    }

    next();
  } catch (error) {
    console.error('Authorization error:', error);
    return res.status(500).json({ 
      error: 'Server error', 
      message: 'Authorization failed' 
    });
  }
};

// Optional authentication (for routes that work with or without auth)
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(); // No token, continue without user
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);

    if (decoded && decoded.type === 'access') {
      const user = await UserMjd.findById(decoded.userId).select('-password -refreshTokens');
      if (user && user.status === 'active' && !user.isLocked) {
        req.user = user;
      }
    }

    next();
  } catch (error) {
    // Silent fail for optional auth
    next();
  }
};

// Rate limiting helper
export const createRateLimiter = (windowMs = 15 * 60 * 1000, max = 5) => {
  const attempts = new Map();

  return (req, res, next) => {
    const key = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    
    if (!attempts.has(key)) {
      attempts.set(key, []);
    }

    const userAttempts = attempts.get(key);
    
    // Remove old attempts outside the window
    const validAttempts = userAttempts.filter(time => now - time < windowMs);
    attempts.set(key, validAttempts);

    if (validAttempts.length >= max) {
      return res.status(429).json({
        error: 'Too many requests',
        message: `Too many attempts. Try again in ${Math.ceil(windowMs / 60000)} minutes.`,
        retryAfter: Math.ceil((validAttempts[0] + windowMs - now) / 1000)
      });
    }

    // Add current attempt
    validAttempts.push(now);
    next();
  };
};

// Validate refresh token and generate new access token
export const refreshAccessToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({ 
        error: 'Refresh token required',
        message: 'No refresh token provided' 
      });
    }

    // Verify refresh token
    const decoded = verifyToken(refreshToken);
    
    if (!decoded || decoded.type !== 'refresh') {
      return res.status(401).json({ 
        error: 'Invalid refresh token',
        message: 'Invalid or expired refresh token' 
      });
    }

    // Find user with this refresh token
    const user = await UserMjd.findByRefreshToken(refreshToken);
    
    if (!user) {
      return res.status(401).json({ 
        error: 'Invalid refresh token',
        message: 'Refresh token not found or expired' 
      });
    }

    // Check user status
    if (user.status !== 'active') {
      return res.status(403).json({ 
        error: 'Account inactive',
        message: 'Your account is not active' 
      });
    }

    if (user.isLocked) {
      return res.status(423).json({ 
        error: 'Account locked',
        message: 'Account is temporarily locked' 
      });
    }

    // Generate new access token
    const newAccessToken = generateAccessToken(user._id);

    // Clean expired tokens
    await user.cleanExpiredTokens();

    res.json({
      success: true,
      accessToken: newAccessToken,
      user: user.toJSON()
    });

  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({ 
      error: 'Server error',
      message: 'Failed to refresh token' 
    });
  }
}; 