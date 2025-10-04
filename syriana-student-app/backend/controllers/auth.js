const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const loginAttempts = new Map();
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
const MAX_ATTEMPTS_PER_IP = 10;

const getClientIP = (req) => {
  return req.headers['x-forwarded-for'] || 
         req.connection.remoteAddress || 
         req.socket.remoteAddress ||
         (req.connection.socket ? req.connection.socket.remoteAddress : null);
};

const checkRateLimit = (ip) => {
  const now = Date.now();
  const attempts = loginAttempts.get(ip) || { count: 0, resetTime: now + RATE_LIMIT_WINDOW };
  
  if (now > attempts.resetTime) {
    loginAttempts.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return { allowed: true, remaining: MAX_ATTEMPTS_PER_IP - 1 };
  }
  
  if (attempts.count >= MAX_ATTEMPTS_PER_IP) {
    return { allowed: false, resetTime: attempts.resetTime };
  }
  
  attempts.count++;
  loginAttempts.set(ip, attempts);
  return { allowed: true, remaining: MAX_ATTEMPTS_PER_IP - attempts.count };
};

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d'
  });
};

exports.register = async (req, res) => {
  try {
    const userData = req.body;

    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    const user = await User.create({
      ...userData,
      role: 'student'
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Student registered successfully',
      data: {
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          studentId: user.studentId,
          major: user.major,
          department: user.department,
          academicYear: user.academicYear
        },
        token
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role
        },
        token
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Enhanced Admin Login with Security Features
exports.adminLogin = async (req, res) => {
  try {
    const { email, password, twoFactorCode } = req.body;
    const clientIP = getClientIP(req);
    const userAgent = req.headers['user-agent'] || 'Unknown';

    // Rate limiting check
    const rateLimit = checkRateLimit(clientIP);
    if (!rateLimit.allowed) {
      const waitTime = Math.ceil((rateLimit.resetTime - Date.now()) / 1000 / 60);
      return res.status(429).json({
        success: false,
        message: `Too many login attempts. Please try again in ${waitTime} minutes.`,
        rateLimited: true,
        resetTime: rateLimit.resetTime
      });
    }

    // Input validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Find user and check if they exist
    const user = await User.findOne({ email }).select('+password +twoFactorSecret +loginAttempts +lockUntil');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if user is admin
    if (user.role !== 'admin') {
      await user.addSecurityLog('unauthorized_admin_access', clientIP, userAgent, false, 'Non-admin attempted admin login');
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    // Check if account is locked
    if (user.isLocked) {
      const lockTimeRemaining = Math.ceil((user.lockUntil - Date.now()) / 1000 / 60);
      await user.addSecurityLog('login_attempt_locked', clientIP, userAgent, false, `Account locked, ${lockTimeRemaining} minutes remaining`);
      
      return res.status(423).json({
        success: false,
        message: `Account is temporarily locked due to multiple failed login attempts. Please try again in ${lockTimeRemaining} minutes.`,
        accountLocked: true,
        lockTimeRemaining
      });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      await user.incLoginAttempts();
      await user.addSecurityLog('failed_login', clientIP, userAgent, false, 'Invalid password');
      
      const attemptsRemaining = Math.max(0, 5 - (user.loginAttempts + 1));
      let message = 'Invalid credentials';
      
      if (attemptsRemaining <= 2 && attemptsRemaining > 0) {
        message += `. Warning: ${attemptsRemaining} attempts remaining before account lockout.`;
      } else if (attemptsRemaining === 0) {
        message = 'Invalid credentials. Account has been temporarily locked due to multiple failed attempts.';
      }

      return res.status(401).json({
        success: false,
        message,
        attemptsRemaining
      });
    }

    // Check two-factor authentication if enabled
    if (user.twoFactorEnabled) {
      if (!twoFactorCode) {
        return res.status(200).json({
          success: false,
          message: 'Two-factor authentication code required',
          requiresTwoFactor: true,
          tempToken: jwt.sign({ id: user._id, step: 'twoFactor' }, process.env.JWT_SECRET, { expiresIn: '5m' })
        });
      }

      // Note: Two-factor verification would require speakeasy package
      // For now, we'll add a placeholder for 2FA verification
      // const speakeasy = require('speakeasy');
      // const verified = speakeasy.totp.verify({
      //   secret: user.twoFactorSecret,
      //   encoding: 'base32',
      //   token: twoFactorCode,
      //   window: 2
      // });

      // Placeholder: Accept any 6-digit code for demo (remove in production)
      const verified = /^\\d{6}$/.test(twoFactorCode);

      if (!verified) {
        await user.addSecurityLog('failed_2fa', clientIP, userAgent, false, 'Invalid 2FA code');
        return res.status(401).json({
          success: false,
          message: 'Invalid two-factor authentication code'
        });
      }
    }

    // Successful login - reset login attempts and update last login info
    await user.resetLoginAttempts();
    user.lastLogin = new Date();
    user.lastLoginIP = clientIP;
    await user.save();

    // Generate session token
    const token = generateToken(user._id);
    await user.addSessionToken(token, clientIP, userAgent);
    await user.addSecurityLog('successful_login', clientIP, userAgent, true, 'Admin login successful');

    // Clear rate limiting for this IP on successful login
    loginAttempts.delete(clientIP);

    // Prepare user data for response (excluding sensitive information)
    const userData = {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      lastLogin: user.lastLogin,
      twoFactorEnabled: user.twoFactorEnabled
    };

    res.json({
      success: true,
      message: 'Admin login successful',
      data: {
        user: userData,
        token,
        sessionInfo: {
          loginTime: new Date(),
          ipAddress: clientIP,
          userAgent: userAgent.substring(0, 100) // Limit length
        }
      }
    });

  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

exports.logout = (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
};

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          studentId: user.studentId
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { firstName, lastName } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { firstName, lastName },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id).select('+password');

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

exports.forgotPassword = async (req, res) => {
  res.json({
    success: true,
    message: 'Password reset email sent (placeholder)'
  });
};

exports.resetPassword = async (req, res) => {
  res.json({
    success: true,
    message: 'Password reset successfully (placeholder)'
  });
};

exports.verifyEmail = async (req, res) => {
  res.json({
    success: true,
    message: 'Email verified successfully (placeholder)'
  });
};

// Enhanced Admin Login with Security Features
exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const clientIP = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent');

    // Enhanced validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
        code: 'MISSING_CREDENTIALS'
      });
    }

    // Find user and check if admin
    const user = await User.findOne({ email }).select('+password +loginAttempts +lockUntil');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid admin credentials',
        code: 'INVALID_CREDENTIALS'
      });
    }

    // Check if user is admin
    if (user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: Admin access required',
        code: 'INSUFFICIENT_PRIVILEGES'
      });
    }

    // Check if account is locked
    if (user.lockUntil && user.lockUntil > Date.now()) {
      const lockTimeRemaining = Math.ceil((user.lockUntil - Date.now()) / 1000 / 60); // minutes
      return res.status(423).json({
        success: false,
        message: `Account temporarily locked. Try again in ${lockTimeRemaining} minutes.`,
        code: 'ACCOUNT_LOCKED',
        lockTimeRemaining
      });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      // Increment failed attempts
      await user.incLoginAttempts();
      
      const attemptsLeft = 5 - (user.loginAttempts || 0);
      
      return res.status(401).json({
        success: false,
        message: `Invalid credentials. ${attemptsLeft > 0 ? `${attemptsLeft} attempts remaining.` : 'Account will be locked.'}`,
        code: 'INVALID_CREDENTIALS',
        attemptsRemaining: Math.max(0, attemptsLeft)
      });
    }

    // Successful login - reset attempts and generate token
    if (user.loginAttempts || user.lockUntil) {
      await user.resetLoginAttempts();
    }

    // Update last login info
    user.lastLogin = new Date();
    user.lastLoginIP = clientIP;
    await user.save();

    const token = generateToken(user._id);

    // Enhanced response with security info
    res.json({
      success: true,
      message: 'Admin login successful',
      data: {
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          lastLogin: user.lastLogin,
          department: user.department
        },
        token,
        security: {
          sessionExpiry: process.env.JWT_EXPIRE || '30d',
          loginIP: clientIP,
          requiresPasswordChange: user.mustChangePassword || false
        }
      }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      code: 'SERVER_ERROR'
    });
  }
};

// Enhanced security check for admin routes
exports.requireAdmin = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.',
        code: 'NO_TOKEN'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token. User not found.',
        code: 'INVALID_TOKEN'
      });
    }

    if (user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.',
        code: 'INSUFFICIENT_PRIVILEGES'
      });
    }

    // Check if account is locked
    if (user.lockUntil && user.lockUntil > Date.now()) {
      return res.status(423).json({
        success: false,
        message: 'Account temporarily locked.',
        code: 'ACCOUNT_LOCKED'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Admin authentication error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid token.',
      code: 'INVALID_TOKEN'
    });
  }
};



