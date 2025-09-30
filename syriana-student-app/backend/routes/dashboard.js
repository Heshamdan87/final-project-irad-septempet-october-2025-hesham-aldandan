const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getStudentDashboard,
  getTeacherDashboard,
  getAdminDashboard,
  getStats,
  getRecentActivity,
  getUpcomingEvents
} = require('../controllers/dashboard');

// All routes require authentication
router.use(protect);

// General dashboard route - returns data based on user role
router.get('/', async (req, res) => {
  try {
    const { role } = req.user;

    switch (role) {
      case 'admin':
        return await getAdminDashboard(req, res);
      case 'teacher':
        return await getTeacherDashboard(req, res);
      case 'student':
        return await getStudentDashboard(req, res);
      default:
        return res.status(403).json({
          success: false,
          message: 'Invalid user role'
        });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Student dashboard
router.get('/student', (req, res, next) => {
  if (req.user.role !== 'student') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Student role required.'
    });
  }
  next();
}, getStudentDashboard);

// Teacher dashboard
router.get('/teacher', (req, res, next) => {
  if (req.user.role !== 'teacher') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Teacher role required.'
    });
  }
  next();
}, getTeacherDashboard);

// Admin dashboard
router.get('/admin', (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin role required.'
    });
  }
  next();
}, getAdminDashboard);

// General stats (accessible by all authenticated users)
router.get('/stats', getStats);
router.get('/activity', getRecentActivity);
router.get('/events', getUpcomingEvents);

module.exports = router;