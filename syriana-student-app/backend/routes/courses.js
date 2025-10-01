const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
  enrollInCourse,
  unenrollFromCourse,
  getCourseStudents,
  getMyCourses,
  getAvailableCourses
} = require('../controllers/courses');


router.use(protect);


router.get('/', getCourses);
router.get('/my-courses', getMyCourses);
router.get('/available', getAvailableCourses);


router.get('/:id', getCourse);
router.get('/:id/students', getCourseStudents);


router.post('/:id/enroll', (req, res, next) => {
  if (req.user.role !== 'student') {
    return res.status(403).json({
      success: false,
      message: 'Only students can enroll in courses'
    });
  }
  next();
}, enrollInCourse);

router.delete('/:id/enroll', (req, res, next) => {
  if (req.user.role !== 'student') {
    return res.status(403).json({
      success: false,
      message: 'Only students can unenroll from courses'
    });
  }
  next();
}, unenrollFromCourse);


router.post('/', (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Only admins can create courses'
    });
  }
  next();
}, createCourse);

router.put('/:id', (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Only admins can update courses'
    });
  }
  next();
}, updateCourse);

router.delete('/:id', (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Only admins can delete courses'
    });
  }
  next();
}, deleteCourse);

module.exports = router;


