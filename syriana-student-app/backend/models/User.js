const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'Please provide first name'],
    trim: true,
    maxlength: [50, 'First name cannot be more than 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Please provide last name'],
    trim: true,
    maxlength: [50, 'Last name cannot be more than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Please provide email'],
    unique: true,
    lowercase: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Please provide password'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  role: {
    type: String,
    enum: ['student', 'admin'],
    default: 'student'
  },
  studentId: {
    type: String,
    unique: true,
    sparse: true, // Only enforce uniqueness if field is not null
    match: [/^STU\d{6}$/, 'Student ID must be in format STU123456']
  },
  // Enhanced security fields
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: {
    type: Date
  },
  lastLogin: {
    type: Date
  },
  lastLoginIP: {
    type: String
  },
  twoFactorEnabled: {
    type: Boolean,
    default: false
  },
  twoFactorSecret: {
    type: String,
    select: false
  },
  sessionTokens: [{
    token: String,
    createdAt: {
      type: Date,
      default: Date.now
    },
    expiresAt: Date,
    ipAddress: String,
    userAgent: String
  }],
  securityLog: [{
    action: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    ipAddress: String,
    userAgent: String,
    success: Boolean,
    details: String
  }],
  phone: {
    type: String,
    match: [/^\+?[\d\s\-\(\)]+$/, 'Please provide a valid phone number']
  },
  dateOfBirth: {
    type: Date
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },

  enrollmentDate: {
    type: Date,
    default: Date.now
  },
  major: {
    type: String,
    trim: true
  },
  department: {
    type: String,
    trim: true
  },
  academicYear: {
    type: String,
    enum: ['Freshman', 'Sophomore', 'Junior', 'Senior', 'Graduate']
  },
  gpa: {
    type: Number,
    min: 0,
    max: 4.0
  },
  grades: [{
    subject: {
      type: String,
      required: true
    },
    grade: {
      type: String,
      enum: ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'D-', 'F'],
      required: true
    },
    semester: {
      type: String,
      enum: ['Fall', 'Spring', 'Summer'],
      required: true
    },
    year: {
      type: Number,
      required: true
    },
    credits: {
      type: Number,
      default: 3
    }
  }],
  avatar: {
    type: String,
    default: 'default-avatar.png'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  },
  lastLoginIP: {
    type: String
  },
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: {
    type: Date
  },
  mustChangePassword: {
    type: Boolean,
    default: false
  },
  passwordResetToken: String,
  passwordResetExpires: Date,
  emailVerificationToken: String,
  isEmailVerified: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});


userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});


userSchema.index({ email: 1 });
userSchema.index({ studentId: 1 });
userSchema.index({ role: 1 });


userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});


userSchema.pre('save', async function(next) {
  if (this.isNew) {
    try {
      if (this.role === 'student' && !this.studentId) {
        const count = await this.constructor.countDocuments({ role: 'student' });
        this.studentId = `STU${String(count + 1).padStart(6, '0')}`;
      }
    } catch (error) {
      return next(error);
    }
  }
  next();
});


userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};


userSchema.methods.getSignedJwtToken = function() {
  return jwt.sign(
    { 
      id: this._id,
      role: this.role,
      email: this.email
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRE || '7d'
    }
  );
};


userSchema.methods.getResetPasswordToken = function() {
  const resetToken = crypto.randomBytes(20).toString('hex');
  
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  
  return resetToken;
};

// Enhanced security methods
userSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

userSchema.methods.incLoginAttempts = function() {
  // If we have a previous lock that has expired, restart at 1
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: {
        lockUntil: 1,
      },
      $set: {
        loginAttempts: 1,
      }
    });
  }
  
  const updates = { $inc: { loginAttempts: 1 } };
  
  // Check if we need to lock the account
  // Lock after 5 failed attempts
  if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
    // Lock for 2 hours initially, then exponentially increase
    const lockTime = Math.pow(2, Math.min(this.loginAttempts - 4, 5)) * 60 * 60 * 1000; // Max 32 hours
    updates.$set = { lockUntil: Date.now() + lockTime };
  }
  
  return this.updateOne(updates);
};

userSchema.methods.resetLoginAttempts = function() {
  return this.updateOne({
    $unset: {
      loginAttempts: 1,
      lockUntil: 1
    }
  });
};

userSchema.methods.addSecurityLog = function(action, ipAddress, userAgent, success, details) {
  this.securityLog.push({
    action,
    ipAddress,
    userAgent,
    success,
    details
  });
  
  // Keep only last 50 security log entries
  if (this.securityLog.length > 50) {
    this.securityLog = this.securityLog.slice(-50);
  }
  
  return this.save();
};

userSchema.methods.addSessionToken = function(token, ipAddress, userAgent) {
  const expiresAt = new Date(Date.now() + (7 * 24 * 60 * 60 * 1000)); // 7 days
  
  this.sessionTokens.push({
    token,
    ipAddress,
    userAgent,
    expiresAt
  });
  
  // Remove expired tokens and keep only last 5 active sessions
  this.sessionTokens = this.sessionTokens
    .filter(session => session.expiresAt > new Date())
    .slice(-5);
  
  return this.save();
};

userSchema.methods.removeSessionToken = function(token) {
  this.sessionTokens = this.sessionTokens.filter(session => session.token !== token);
  return this.save();
};

// Account locking methods for enhanced security
userSchema.methods.incLoginAttempts = function() {
  // If we have a previous lock that has expired, restart at 1
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $set: {
        loginAttempts: 1
      },
      $unset: {
        lockUntil: 1
      }
    });
  }
  
  const updates = { $inc: { loginAttempts: 1 } };
  
  // Lock account after 5 failed attempts
  if (this.loginAttempts + 1 >= 5 && !this.lockUntil) {
    // Lock for progressively longer periods: 15min, 30min, 1hr, 2hr, 24hr
    const lockTimes = [15, 30, 60, 120, 1440]; // minutes
    const lockIndex = Math.min(Math.floor((this.loginAttempts || 0) / 5), lockTimes.length - 1);
    const lockDuration = lockTimes[lockIndex] * 60 * 1000; // convert to milliseconds
    
    updates.$set = { lockUntil: Date.now() + lockDuration };
  }
  
  return this.updateOne(updates);
};

userSchema.methods.resetLoginAttempts = function() {
  return this.updateOne({
    $unset: {
      loginAttempts: 1,
      lockUntil: 1
    }
  });
};

module.exports = mongoose.model('User', userSchema);


