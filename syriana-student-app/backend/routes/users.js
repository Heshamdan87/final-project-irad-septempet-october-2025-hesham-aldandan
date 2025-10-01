const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getStudents, getStudent, updateStudent, deleteStudent, createUser } = require('../controllers/users');


router.use(protect);
router.use((req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin role required.'
    });
  }
  next();
});

router.route('/')
  .get(getStudents)
  .post(createUser);

router.route('/:id')
  .get(getStudent)
  .put(updateStudent)
  .delete(deleteStudent);

module.exports = router;


