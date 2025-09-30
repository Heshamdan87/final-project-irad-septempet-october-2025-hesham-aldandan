const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getGrades,
  getGrade,
  createGrade,
  updateGrade,
  deleteGrade,
  getStudentGrades,
  getCourseGrades,
  getMyGrades,
  bulkCreateGrades,
  exportGrades
} = require('../controllers/grades');

// All routes require authentication
router.use(protect);

// General routes
router.get('/', getGrades);
router.get('/export', exportGrades);
router.post('/bulk', (req, res, next) => {
  if (req.user.role !== 'admin' && req.user.role !== 'teacher') {
    return res.status(403).json({
      success: false,
      message: 'Only admins and teachers can create grades'
    });
  }
  next();
}, bulkCreateGrades);

// Student-specific routes
router.get('/my-grades', (req, res, next) => {
  if (req.user.role !== 'student') {
    return res.status(403).json({
      success: false,
      message: 'Only students can access their own grades'
    });
  }
  next();
}, getMyGrades);

router.get('/student/:studentId', getStudentGrades);
router.get('/course/:courseId', getCourseGrades);

// Grade CRUD routes
router.get('/:id', getGrade);

router.post('/', (req, res, next) => {
  if (req.user.role !== 'admin' && req.user.role !== 'teacher') {
    return res.status(403).json({
      success: false,
      message: 'Only admins and teachers can create grades'
    });
  }
  next();
}, createGrade);

router.put('/:id', (req, res, next) => {
  if (req.user.role !== 'admin' && req.user.role !== 'teacher') {
    return res.status(403).json({
      success: false,
      message: 'Only admins and teachers can update grades'
    });
  }
  next();
}, updateGrade);

router.delete('/:id', (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Only admins can delete grades'
    });
  }
  next();
}, deleteGrade);

module.exports = router;