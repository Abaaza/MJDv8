import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userMjdSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    validate: {
      validator: function(email) {
        return /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email);
      },
      message: 'Please enter a valid email address'
    }
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'inactive', 'rejected'],
    default: 'pending'
  },
  company: {
    type: String,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  profilePicture: {
    type: String
  },
  lastLogin: {
    type: Date
  },
  failedLoginAttempts: {
    type: Number,
    default: 0
  },
  accountLockedUntil: {
    type: Date
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: {
    type: String
  },
  passwordResetToken: {
    type: String
  },
  passwordResetExpires: {
    type: Date
  },
  refreshTokens: [{
    token: String,
    createdAt: { type: Date, default: Date.now },
    expiresAt: Date
  }],
  preferences: {
    theme: {
      type: String,
      enum: ['light', 'dark', 'system'],
      default: 'light'
    },
    emailNotifications: {
      type: Boolean,
      default: true
    },
    pushNotifications: {
      type: Boolean,
      default: true
    }
  },
  // Approval workflow fields
  accessRequest: {
    message: String,
    requestedRole: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user'
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'UserMjd'
    },
    approvedAt: Date,
    rejectedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'UserMjd'
    },
    rejectedAt: Date,
    adminNotes: String
  }
}, {
  timestamps: true,
  collection: 'users_mjd', // Custom collection name to avoid conflicts
  toJSON: {
    transform: function(doc, ret) {
      delete ret.password;
      delete ret.refreshTokens;
      delete ret.emailVerificationToken;
      delete ret.passwordResetToken;
      delete ret.__v;
      return ret;
    }
  }
});

// Indexes for performance (email index is automatic due to unique: true)
userMjdSchema.index({ status: 1 });
userMjdSchema.index({ role: 1 });
userMjdSchema.index({ 'refreshTokens.token': 1 });

// Virtual for account locked status
userMjdSchema.virtual('isLocked').get(function() {
  return !!(this.failedLoginAttempts >= 5 && this.accountLockedUntil && Date.now() < this.accountLockedUntil);
});

// Pre-save middleware to hash password
userMjdSchema.pre('save', async function(next) {
  // Only hash password if it's modified or new
  if (!this.isModified('password')) return next();
  
  try {
    // Hash password with cost of 12
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userMjdSchema.methods.comparePassword = async function(candidatePassword) {
  if (!candidatePassword || !this.password) return false;
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to increment failed login attempts
userMjdSchema.methods.incLoginAttempts = function() {
  // If we have a previous lock that has expired, restart at 1
  if (this.accountLockedUntil && this.accountLockedUntil < Date.now()) {
    return this.updateOne({
      $unset: { accountLockedUntil: 1 },
      $set: { failedLoginAttempts: 1 }
    });
  }
  
  const updates = { $inc: { failedLoginAttempts: 1 } };
  
  // Lock account after 5 failed attempts for 2 hours
  if (this.failedLoginAttempts + 1 >= 5 && !this.isLocked) {
    updates.$set = { accountLockedUntil: Date.now() + 2 * 60 * 60 * 1000 }; // 2 hours
  }
  
  return this.updateOne(updates);
};

// Method to reset login attempts
userMjdSchema.methods.resetLoginAttempts = function() {
  return this.updateOne({
    $unset: { 
      failedLoginAttempts: 1,
      accountLockedUntil: 1
    }
  });
};

// Method to add refresh token
userMjdSchema.methods.addRefreshToken = function(token, expiresIn = 7 * 24 * 60 * 60 * 1000) { // 7 days
  this.refreshTokens.push({
    token,
    expiresAt: new Date(Date.now() + expiresIn)
  });
  
  // Keep only last 5 refresh tokens
  if (this.refreshTokens.length > 5) {
    this.refreshTokens = this.refreshTokens.slice(-5);
  }
  
  return this.save();
};

// Method to remove refresh token
userMjdSchema.methods.removeRefreshToken = function(token) {
  this.refreshTokens = this.refreshTokens.filter(rt => rt.token !== token);
  return this.save();
};

// Method to clean expired refresh tokens
userMjdSchema.methods.cleanExpiredTokens = function() {
  this.refreshTokens = this.refreshTokens.filter(rt => rt.expiresAt > new Date());
  return this.save();
};

// Static method to find user by refresh token
userMjdSchema.statics.findByRefreshToken = function(token) {
  return this.findOne({
    'refreshTokens.token': token,
    'refreshTokens.expiresAt': { $gt: new Date() }
  });
};

export default mongoose.model('UserMjd', userMjdSchema); 