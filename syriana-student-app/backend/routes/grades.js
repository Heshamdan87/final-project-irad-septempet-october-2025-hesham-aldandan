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

// Allow students to submit their own grades
router.post('/student-submit', (req, res, next) => {
  if (req.user.role !== 'student') {
    return res.status(403).json({
      success: false,
      message: 'Only students can submit their own grades'
    });
  }
  next();
}, async (req, res) => {
  try {
    const { courseName, courseCode, grade, semester, year, credits, comments } = req.body;
    
    const Grade = require('../models/Grade');
    
    // Create grade entry with student-submitted data
    const newGrade = await Grade.create({
      student: req.user._id,
      courseName,
      courseCode,
      grade,
      semester,
      year,
      credits,
      comments: comments || 'Self-reported grade',
      gradedBy: req.user._id, // Student is reporting their own grade
      isStudentSubmitted: true // Flag to indicate this is student-submitted
    });
    
    await newGrade.populate([
      { path: 'student', select: 'firstName lastName studentId email' }
    ]);
    
    res.status(201).json({
      success: true,
      data: newGrade,
      message: 'Grade entry created successfully'
    });
  } catch (error) {
    console.error('Error creating student grade:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

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


