const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getStudentDashboard,
  getAdminDashboard,
  getStats,
  getRecentActivity,
  getUpcomingEvents,
  getStudentCount,
  getGradeStatistics,
  getSubjectGradeStatistics,
  getStudentPerformanceAnalytics
} = require('../controllers/dashboard');


router.use(protect);


router.get('/', async (req, res) => {
  try {
    const { role } = req.user;

    switch (role) {
      case 'admin':
        return await getAdminDashboard(req, res);
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


router.get('/student', (req, res, next) => {
  if (req.user.role !== 'student') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Student role required.'
    });
  }
  next();
}, getStudentDashboard);


router.get('/admin', (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin role required.'
    });
  }
  next();
}, getAdminDashboard);


router.get('/stats', getStats);
router.get('/activity', getRecentActivity);
router.get('/events', getUpcomingEvents);

// Admin-only statistical routes
router.get('/students/count', (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin role required.'
    });
  }
  next();
}, getStudentCount);

router.get('/grades/statistics', (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin role required.'
    });
  }
  next();
}, getGradeStatistics);

router.get('/subjects/grades', (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin role required.'
    });
  }
  next();
}, getSubjectGradeStatistics);

router.get('/students/performance', (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin role required.'
    });
  }
  next();
}, getStudentPerformanceAnalytics);

module.exports = router;


