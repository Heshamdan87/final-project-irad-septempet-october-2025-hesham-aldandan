const Course = require('../models/Course');
const User = require('../models/User');

exports.getCourses = async (req, res) => {
  try {
    const { page = 1, limit = 10, department, semester, year } = req.query;

    const query = {};
    if (department) {
      query.department = department;
    }
    if (semester) {
      query.semester = semester;
    }
    if (year) {
      query.year = parseInt(year);
    }

    const courses = await Course.find(query)
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
    console.error('Error fetching courses:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching courses'
    });
  }
};


exports.getCourse = async (req, res) => {
  try {

    const course = await Course.findById(req.params.id)
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
    console.error('Error fetching course:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching course'
    });
  }
};


exports.createCourse = async (req, res) => {
  try {

    const {
      courseCode,
      title,
      description,
      credits,
      department,
      schedule,
      semester,
      year,
      capacity,
      enrollmentStart,
      enrollmentEnd,
      courseStart,
      courseEnd
    } = req.body;


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
      schedule,
      semester,
      year,
      capacity,
      enrollmentStart,
      enrollmentEnd,
      courseStart,
      courseEnd
    });


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


exports.updateCourse = async (req, res) => {
  try {

    const course = await Course.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true } // Return updated document and validate
    );


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


exports.enrollInCourse = async (req, res) => {
  try {

    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }


    if (course.students.length >= course.capacity) {
      return res.status(400).json({
        success: false,
        message: 'Course is full'
      });
    }


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


exports.unenrollFromCourse = async (req, res) => {
  try {

    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }


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


exports.getCourseStudents = async (req, res) => {
  try {

    const course = await Course.findById(req.params.id)
      .populate('students.student', 'firstName lastName studentId email')
      .select('students'); // Only return students array

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


exports.getMyCourses = async (req, res) => {
  try {

    const courses = await Course.find({ 'students.student': req.user._id })
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


exports.getAvailableCourses = async (req, res) => {
  try {

    const enrolledCourseIds = await Course.find({ 'students.student': req.user._id })
      .select('_id');


    const enrolledIds = enrolledCourseIds.map(course => course._id);




    const courses = await Course.find({
      _id: { $nin: enrolledIds },                    // Not enrolled
      enrollmentStart: { $lte: new Date() },         // Enrollment started
      enrollmentEnd: { $gte: new Date() }            // Enrollment not ended
    })
      .select('courseCode title description credits department semester year capacity students');


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



