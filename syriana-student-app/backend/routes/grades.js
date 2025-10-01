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


router.use(protect);


router.get('/', getGrades);
router.get('/export', exportGrades);
router.post('/bulk', (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Only admins can create grades'
    });
  }
  next();
}, bulkCreateGrades);


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


router.get('/:id', getGrade);

router.post('/', (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Only admins can create grades'
    });
  }
  next();
}, createGrade);

router.put('/:id', (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Only admins can update grades'
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


