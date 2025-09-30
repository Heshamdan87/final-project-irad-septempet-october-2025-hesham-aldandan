const Course = require('../models/Course');
const User = require('../models/User');

// @desc    Get all courses
// @route   GET /api/courses
// @access  Private
exports.getCourses = async (req, res) => {
  try {
    const { page = 1, limit = 10, department, semester, year, teacher } = req.query;

    const query = {};
    if (department) query.department = department;
    if (semester) query.semester = semester;
    if (year) query.year = parseInt(year);
    if (teacher) query.teacher = teacher;

    const courses = await Course.find(query)
      .populate('teacher', 'firstName lastName email')
      .populate('students.student', 'firstName lastName studentId')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Course.countDocuments(query);

    res.json({
      success: true,
      data: courses,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
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

// @desc    Get single course
// @route   GET /api/courses/:id
// @access  Private
exports.getCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('teacher', 'firstName lastName email')
      .populate('students.student', 'firstName lastName studentId email');

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    res.json({
      success: true,
      data: course
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Create new course
// @route   POST /api/courses
// @access  Private (Admin/Teacher)
exports.createCourse = async (req, res) => {
  try {
    const {
      courseCode,
      title,
      description,
      credits,
      department,
      teacher,
      schedule,
      semester,
      year,
      capacity,
      enrollmentStart,
      enrollmentEnd,
      courseStart,
      courseEnd
    } = req.body;

    // Check if course code already exists
    const existingCourse = await Course.findOne({ courseCode });
    if (existingCourse) {
      return res.status(400).json({
        success: false,
        message: 'Course code already exists'
      });
    }

    const course = await Course.create({
      courseCode,
      title,
      description,
      credits,
      department,
      teacher: teacher || req.user._id,
      schedule,
      semester,
      year,
      capacity,
      enrollmentStart,
      enrollmentEnd,
      courseStart,
      courseEnd
    });

    await course.populate('teacher', 'firstName lastName email');

    res.status(201).json({
      success: true,
      data: course,
      message: 'Course created successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update course
// @route   PUT /api/courses/:id
// @access  Private (Admin/Teacher)
exports.updateCourse = async (req, res) => {
  try {
    const course = await Course.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('teacher', 'firstName lastName email');

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    res.json({
      success: true,
      data: course,
      message: 'Course updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Delete course
// @route   DELETE /api/courses/:id
// @access  Private (Admin)
exports.deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    await course.deleteOne();

    res.json({
      success: true,
      message: 'Course deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Enroll in course
// @route   POST /api/courses/:id/enroll
// @access  Private (Student)
exports.enrollInCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check if course is full
    if (course.students.length >= course.capacity) {
      return res.status(400).json({
        success: false,
        message: 'Course is full'
      });
    }

    // Check if student is already enrolled
    const isEnrolled = course.students.some(
      student => student.student.toString() === req.user._id.toString()
    );

    if (isEnrolled) {
      return res.status(400).json({
        success: false,
        message: 'Already enrolled in this course'
      });
    }

    course.students.push({
      student: req.user._id,
      enrolledAt: new Date()
    });

    await course.save();

    res.json({
      success: true,
      message: 'Successfully enrolled in course'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Unenroll from course
// @route   DELETE /api/courses/:id/enroll
// @access  Private (Student)
exports.unenrollFromCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Find and remove student from course
    course.students = course.students.filter(
      student => student.student.toString() !== req.user._id.toString()
    );

    await course.save();

    res.json({
      success: true,
      message: 'Successfully unenrolled from course'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get course students
// @route   GET /api/courses/:id/students
// @access  Private (Teacher/Admin)
exports.getCourseStudents = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('students.student', 'firstName lastName studentId email')
      .select('students');

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    res.json({
      success: true,
      data: course.students
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get student's enrolled courses
// @route   GET /api/courses/my-courses
// @access  Private (Student)
exports.getMyCourses = async (req, res) => {
  try {
    const courses = await Course.find({ 'students.student': req.user._id })
      .populate('teacher', 'firstName lastName email')
      .select('courseCode title description credits department semester year schedule');

    res.json({
      success: true,
      data: courses
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get available courses for enrollment
// @route   GET /api/courses/available
// @access  Private (Student)
exports.getAvailableCourses = async (req, res) => {
  try {
    const enrolledCourseIds = await Course.find({ 'students.student': req.user._id })
      .select('_id');

    const enrolledIds = enrolledCourseIds.map(course => course._id);

    const courses = await Course.find({
      _id: { $nin: enrolledIds },
      enrollmentStart: { $lte: new Date() },
      enrollmentEnd: { $gte: new Date() }
    })
      .populate('teacher', 'firstName lastName email')
      .select('courseCode title description credits department semester year capacity students');

    // Filter out full courses
    const availableCourses = courses.filter(course => course.students.length < course.capacity);

    res.json({
      success: true,
      data: availableCourses
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};