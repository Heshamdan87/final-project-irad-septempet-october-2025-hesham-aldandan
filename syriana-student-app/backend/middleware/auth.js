const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes - check if user is authenticated
exports.protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Check if token exists
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Get user from database
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Access denied. User not found.'
        });
      }

      if (!user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Access denied. Account is deactivated.'
        });
      }

      // Add user to request object
      req.user = user;
      next();

    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Invalid token.'
      });
    }

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error during authentication'
    });
  }
};

// Grant access to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. User not authenticated.'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Role '${req.user.role}' is not authorized to access this route.`
      });
    }

    next();
  };
};

// Check if user owns the resource or is admin
exports.checkOwnership = (req, res, next) => {
  const resourceUserId = req.params.userId || req.body.userId;
  
  if (req.user.role === 'admin' || req.user._id.toString() === resourceUserId) {
    return next();
  }

  return res.status(403).json({
    success: false,
    message: 'Access denied. You can only access your own resources.'
  });
};

// Check if user is teacher of the course or admin
exports.checkCourseTeacher = async (req, res, next) => {
  try {
    const Course = require('../models/Course');
    const courseId = req.params.courseId || req.body.courseId;
    
    const course = await Course.findById(courseId);
    
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    if (req.user.role === 'admin' || course.teacher.toString() === req.user._id.toString()) {
      req.course = course;
      return next();
    }

    return res.status(403).json({
      success: false,
      message: 'Access denied. You are not the teacher of this course.'
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error during course authorization'
    });
  }
};

// Check if user is enrolled in the course, is the teacher, or is admin
exports.checkCourseAccess = async (req, res, next) => {
  try {
    const Course = require('../models/Course');
    const courseId = req.params.courseId || req.body.courseId;
    
    const course = await Course.findById(courseId);
    
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check if user is admin, teacher, or enrolled student
    const isTeacher = course.teacher.toString() === req.user._id.toString();
    const isEnrolled = course.students.some(student => student.toString() === req.user._id.toString());
    const isAdmin = req.user.role === 'admin';

    if (isAdmin || isTeacher || isEnrolled) {
      req.course = course;
      return next();
    }

    return res.status(403).json({
      success: false,
      message: 'Access denied. You do not have access to this course.'
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error during course access check'
    });
  }
};