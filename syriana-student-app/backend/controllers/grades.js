const Grade = require('../models/Grade');
const Course = require('../models/Course');
const User = require('../models/User');

// @desc    Get all grades
// @route   GET /api/grades
// @access  Private
exports.getGrades = async (req, res) => {
  try {
    const { page = 1, limit = 10, student, course, semester, year } = req.query;

    const query = {};
    if (student) query.student = student;
    if (course) query.course = course;
    if (semester) query.semester = semester;
    if (year) query.year = parseInt(year);

    // Role-based filtering
    if (req.user.role === 'student') {
      query.student = req.user._id;
    } else if (req.user.role === 'teacher') {
      // Teachers can only see grades for courses they teach
      const teacherCourses = await Course.find({ teacher: req.user._id }).select('_id');
      query.course = { $in: teacherCourses.map(c => c._id) };
    }

    const grades = await Grade.find(query)
      .populate('student', 'firstName lastName studentId email')
      .populate('course', 'courseCode title')
      .populate('gradedBy', 'firstName lastName')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Grade.countDocuments(query);

    res.json({
      success: true,
      data: grades,
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

// @desc    Get single grade
// @route   GET /api/grades/:id
// @access  Private
exports.getGrade = async (req, res) => {
  try {
    const grade = await Grade.findById(req.params.id)
      .populate('student', 'firstName lastName studentId email')
      .populate('course', 'courseCode title')
      .populate('gradedBy', 'firstName lastName');

    if (!grade) {
      return res.status(404).json({
        success: false,
        message: 'Grade not found'
      });
    }

    // Check permissions
    if (req.user.role === 'student' && grade.student._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    if (req.user.role === 'teacher') {
      const course = await Course.findById(grade.course._id);
      if (course.teacher.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }
    }

    res.json({
      success: true,
      data: grade
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Create new grade
// @route   POST /api/grades
// @access  Private (Teacher/Admin)
exports.createGrade = async (req, res) => {
  try {
    const { student, course, grade, semester, year, credits, comments } = req.body;

    // Check if teacher teaches this course
    if (req.user.role === 'teacher') {
      const courseDoc = await Course.findById(course);
      if (!courseDoc || courseDoc.teacher.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'You can only grade students in courses you teach'
        });
      }
    }

    // Check if grade already exists for this student/course/semester/year
    const existingGrade = await Grade.findOne({ student, course, semester, year });
    if (existingGrade) {
      return res.status(400).json({
        success: false,
        message: 'Grade already exists for this student, course, and semester'
      });
    }

    const newGrade = await Grade.create({
      student,
      course,
      grade,
      semester,
      year,
      credits,
      comments,
      gradedBy: req.user._id
    });

    await newGrade.populate([
      { path: 'student', select: 'firstName lastName studentId email' },
      { path: 'course', select: 'courseCode title' },
      { path: 'gradedBy', select: 'firstName lastName' }
    ]);

    res.status(201).json({
      success: true,
      data: newGrade,
      message: 'Grade created successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update grade
// @route   PUT /api/grades/:id
// @access  Private (Teacher/Admin)
exports.updateGrade = async (req, res) => {
  try {
    const grade = await Grade.findById(req.params.id);

    if (!grade) {
      return res.status(404).json({
        success: false,
        message: 'Grade not found'
      });
    }

    // Check permissions
    if (req.user.role === 'teacher') {
      const course = await Course.findById(grade.course);
      if (course.teacher.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'You can only update grades for courses you teach'
        });
      }
    }

    const updatedGrade = await Grade.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate([
      { path: 'student', select: 'firstName lastName studentId email' },
      { path: 'course', select: 'courseCode title' },
      { path: 'gradedBy', select: 'firstName lastName' }
    ]);

    res.json({
      success: true,
      data: updatedGrade,
      message: 'Grade updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Delete grade
// @route   DELETE /api/grades/:id
// @access  Private (Admin)
exports.deleteGrade = async (req, res) => {
  try {
    const grade = await Grade.findById(req.params.id);

    if (!grade) {
      return res.status(404).json({
        success: false,
        message: 'Grade not found'
      });
    }

    await grade.deleteOne();

    res.json({
      success: true,
      message: 'Grade deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get student's grades
// @route   GET /api/grades/student/:studentId
// @access  Private
exports.getStudentGrades = async (req, res) => {
  try {
    const { studentId } = req.params;

    // Check permissions
    if (req.user.role === 'student' && req.user._id.toString() !== studentId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const grades = await Grade.find({ student: studentId })
      .populate('course', 'courseCode title credits')
      .populate('gradedBy', 'firstName lastName')
      .sort({ year: -1, semester: -1 });

    res.json({
      success: true,
      data: grades
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get course grades
// @route   GET /api/grades/course/:courseId
// @access  Private (Teacher/Admin)
exports.getCourseGrades = async (req, res) => {
  try {
    const { courseId } = req.params;

    // Check permissions for teachers
    if (req.user.role === 'teacher') {
      const course = await Course.findById(courseId);
      if (!course || course.teacher.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }
    }

    const grades = await Grade.find({ course: courseId })
      .populate('student', 'firstName lastName studentId email')
      .populate('gradedBy', 'firstName lastName')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: grades
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get my grades (for students)
// @route   GET /api/grades/my-grades
// @access  Private (Student)
exports.getMyGrades = async (req, res) => {
  try {
    const grades = await Grade.find({ student: req.user._id })
      .populate('course', 'courseCode title credits department')
      .populate('gradedBy', 'firstName lastName')
      .sort({ year: -1, semester: -1 });

    res.json({
      success: true,
      data: grades
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Bulk create grades
// @route   POST /api/grades/bulk
// @access  Private (Teacher/Admin)
exports.bulkCreateGrades = async (req, res) => {
  try {
    const { grades } = req.body;

    if (!Array.isArray(grades) || grades.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Grades array is required'
      });
    }

    const createdGrades = [];

    for (const gradeData of grades) {
      const { student, course, grade, semester, year, credits, comments } = gradeData;

      // Check permissions
      if (req.user.role === 'teacher') {
        const courseDoc = await Course.findById(course);
        if (!courseDoc || courseDoc.teacher.toString() !== req.user._id.toString()) {
          continue; // Skip this grade
        }
      }

      // Check if grade already exists
      const existingGrade = await Grade.findOne({ student, course, semester, year });
      if (existingGrade) continue;

      const newGrade = await Grade.create({
        student,
        course,
        grade,
        semester,
        year,
        credits,
        comments,
        gradedBy: req.user._id
      });

      createdGrades.push(newGrade);
    }

    res.status(201).json({
      success: true,
      data: createdGrades,
      message: `${createdGrades.length} grades created successfully`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Export grades
// @route   GET /api/grades/export
// @access  Private
exports.exportGrades = async (req, res) => {
  try {
    const { student, course, semester, year, format = 'csv' } = req.query;

    const query = {};
    if (student) query.student = student;
    if (course) query.course = course;
    if (semester) query.semester = semester;
    if (year) query.year = parseInt(year);

    // Role-based filtering
    if (req.user.role === 'student') {
      query.student = req.user._id;
    } else if (req.user.role === 'teacher') {
      const teacherCourses = await Course.find({ teacher: req.user._id }).select('_id');
      query.course = { $in: teacherCourses.map(c => c._id) };
    }

    const grades = await Grade.find(query)
      .populate('student', 'firstName lastName studentId email')
      .populate('course', 'courseCode title')
      .populate('gradedBy', 'firstName lastName')
      .sort({ createdAt: -1 });

    if (format === 'csv') {
      const csvData = grades.map(grade => ({
        StudentID: grade.student.studentId,
        StudentName: `${grade.student.firstName} ${grade.student.lastName}`,
        CourseCode: grade.course.courseCode,
        CourseTitle: grade.course.title,
        Grade: grade.grade,
        Semester: grade.semester,
        Year: grade.year,
        Credits: grade.credits,
        GradedBy: `${grade.gradedBy.firstName} ${grade.gradedBy.lastName}`,
        GradedAt: grade.createdAt.toISOString()
      }));

      // Convert to CSV string
      const csvString = [
        Object.keys(csvData[0]).join(','),
        ...csvData.map(row => Object.values(row).join(','))
      ].join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="grades.csv"');
      res.send(csvString);
    } else {
      res.json({
        success: true,
        data: grades
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};