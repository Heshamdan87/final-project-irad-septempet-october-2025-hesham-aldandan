const Grade = require('../models/Grade');
const Course = require('../models/Course');
const User = require('../models/User');


exports.getGrades = async (req, res) => {
  try {

    const { page = 1, limit = 10, student, course, semester, year } = req.query;


    const query = {};
    if (student) {
      query.student = student;
    }
    if (course) {
      query.course = course;
    }
    if (semester) {
      query.semester = semester;
    }
    if (year) {
      query.year = parseInt(year);
    }


    if (req.user.role === 'student') {
      query.student = req.user._id;
    }


    const grades = await Grade.find(query)
      .populate('student', 'firstName lastName studentId email')
      .populate('course', 'courseCode title')
      .populate('gradedBy', 'firstName lastName')
      .limit(limit * 1)                    // Convert limit to number
      .skip((page - 1) * limit)           // Calculate skip for pagination
      .sort({ createdAt: -1 });           // Sort by creation date (newest first)


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
    console.error('Error fetching grades:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching grades'
    });
  }
};


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


    if (req.user.role === 'student' && grade.student._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
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


exports.createGrade = async (req, res) => {
  try {

    const { student, course, grade, semester, year, credits, comments } = req.body;


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
      gradedBy: req.user._id  // Track who assigned the grade
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


exports.updateGrade = async (req, res) => {
  try {

    const grade = await Grade.findById(req.params.id);

    if (!grade) {
      return res.status(404).json({
        success: false,
        message: 'Grade not found'
      });
    }


    const updatedGrade = await Grade.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }  // Return updated doc and validate
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


exports.getStudentGrades = async (req, res) => {
  try {
    const { studentId } = req.params;


    if (req.user.role === 'student' && req.user._id.toString() !== studentId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }


    const grades = await Grade.find({ student: studentId })
      .populate('course', 'courseCode title credits')  // Course information
      .populate('gradedBy', 'firstName lastName')      // Who graded it
      .sort({ year: -1, semester: -1 });               // Sort by year/semester descending


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


exports.getCourseGrades = async (req, res) => {
  try {
    const { courseId } = req.params;


    const grades = await Grade.find({ course: courseId })
      .populate('student', 'firstName lastName studentId email')
      .populate('gradedBy', 'firstName lastName')
      .sort({ createdAt: -1 });                                  // Sort by creation date


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


exports.getMyGrades = async (req, res) => {
  try {

    const grades = await Grade.find({ student: req.user._id })
      .populate('course', 'courseCode title credits department')
      .populate('gradedBy', 'firstName lastName')                // Grader information
      .sort({ year: -1, semester: -1 });                         // Sort by academic period


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


      const existingGrade = await Grade.findOne({ student, course, semester, year });
      if (existingGrade) {
        continue; // Skip duplicate
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


exports.exportGrades = async (req, res) => {
  try {

    const { student, course, semester, year, format = 'csv' } = req.query;


    const query = {};
    if (student) {
      query.student = student;
    }
    if (course) {
      query.course = course;
    }
    if (semester) {
      query.semester = semester;
    }
    if (year) {
      query.year = parseInt(year);
    }


    if (req.user.role === 'student') {
      query.student = req.user._id;
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


      const csvString = [
        Object.keys(csvData[0]).join(','),  // Header row
        ...csvData.map(row => Object.values(row).join(','))  // Data rows
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



