const jwt = require('jsonwebtoken');
const User = require('../models/User');


exports.protect = async (req, res, next) => {
  try {
    let token;


    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }


    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    try {

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      

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


    const isEnrolled = course.students.some(student => student.toString() === req.user._id.toString());
    const isAdmin = req.user.role === 'admin';

    if (isAdmin || isEnrolled) {
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


