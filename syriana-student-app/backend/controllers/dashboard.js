const User = require('../models/User');
const Course = require('../models/Course');
const Grade = require('../models/Grade');

// @desc    Get student dashboard data
// @route   GET /api/dashboard/student
// @access  Private (Student only)
exports.getStudentDashboard = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get user's enrolled courses
    const enrolledCourses = await Course.find({ 'students.student': userId })
      .select('name code description credits semester year')
      .populate('teacher', 'firstName lastName');

    // Get user's grades
    const grades = await Grade.find({ student: userId })
      .populate('course', 'name code')
      .select('course grade semester year credits');

    // Calculate GPA
    let totalCredits = 0;
    let totalPoints = 0;

    grades.forEach(grade => {
      const gradePoint = getGradePoint(grade.grade);
      totalCredits += grade.credits || 0;
      totalPoints += gradePoint * (grade.credits || 0);
    });

    const gpa = totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : 0;

    // Determine academic standing
    const gpaValue = parseFloat(gpa);
    let academicStanding = 'Good Standing';
    if (gpaValue < 2.0) {
      academicStanding = 'Academic Probation';
    } else if (gpaValue < 2.5) {
      academicStanding = 'Academic Warning';
    }

    res.json({
      success: true,
      data: {
        myCourses: enrolledCourses.length,
        myGrades: grades.length,
        gpa: parseFloat(gpa),
        academicStanding
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

// @desc    Get teacher dashboard data
// @route   GET /api/dashboard/teacher
// @access  Private (Teacher only)
exports.getTeacherDashboard = async (req, res) => {
  try {
    const teacherId = req.user._id;

    // Get courses taught by teacher
    const courses = await Course.find({ teacher: teacherId })
      .select('name code students semester year');

    // Get total students
    const totalStudents = new Set();
    courses.forEach(course => {
      course.students.forEach(student => {
        totalStudents.add(student.student.toString());
      });
    });

    // Get recent grades submitted (placeholder)
    const recentGrades = await Grade.find({ course: { $in: courses.map(c => c._id) } })
      .populate('student', 'firstName lastName')
      .populate('course', 'name code')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      success: true,
      data: {
        myCourses: courses.length,
        myStudents: totalStudents.size,
        recentGrades
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

// @desc    Get admin dashboard data
// @route   GET /api/dashboard/admin
// @access  Private (Admin only)
exports.getAdminDashboard = async (req, res) => {
  try {
    // Get user statistics
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalTeachers = await User.countDocuments({ role: 'teacher' });
    const totalAdmins = await User.countDocuments({ role: 'admin' });
    const totalUsers = totalStudents + totalTeachers + totalAdmins;

    // Get course statistics
    const totalCourses = await Course.countDocuments();

    // Get grade statistics
    const totalGrades = await Grade.countDocuments();

    // Get recent activities (placeholder)
    const recentUsers = await User.find()
      .select('firstName lastName email role createdAt')
      .sort({ createdAt: -1 })
      .limit(5);

    // Format recent activity data
    const recentActivity = recentUsers.map(user => ({
      type: 'user_registration',
      description: `${user.firstName} ${user.lastName} (${user.role}) joined the system`,
      timestamp: user.createdAt
    }));

    res.json({
      success: true,
      data: {
        totalUsers,
        totalCourses,
        totalGrades,
        userStats: {
          admins: totalAdmins,
          teachers: totalTeachers,
          students: totalStudents
        },
        recentActivity
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

// @desc    Get dashboard statistics
// @route   GET /api/dashboard/stats
// @access  Private
exports.getStats = async (req, res) => {
  try {
    const stats = {
      totalUsers: await User.countDocuments(),
      totalCourses: await Course.countDocuments(),
      totalGrades: await Grade.countDocuments(),
      activeStudents: await User.countDocuments({ role: 'student' }),
      activeTeachers: await User.countDocuments({ role: 'teacher' })
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get recent activity
// @route   GET /api/dashboard/activity
// @access  Private
exports.getRecentActivity = async (req, res) => {
  try {
    // Get recent user registrations
    const recentUsers = await User.find()
      .select('firstName lastName email role createdAt')
      .sort({ createdAt: -1 })
      .limit(10);

    // Get recent grades
    const recentGrades = await Grade.find()
      .populate('student', 'firstName lastName')
      .populate('course', 'name code')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      success: true,
      data: {
        recentUsers,
        recentGrades
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

// @desc    Get upcoming events
// @route   GET /api/dashboard/events
// @access  Private
exports.getUpcomingEvents = async (req, res) => {
  try {
    // Placeholder for upcoming events
    const events = [
      {
        id: 1,
        title: 'Semester End',
        date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        type: 'academic'
      },
      {
        id: 2,
        title: 'Registration Deadline',
        date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
        type: 'registration'
      }
    ];

    res.json({
      success: true,
      data: events
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Helper function to convert grade to grade points
const getGradePoint = (grade) => {
  const gradeMap = {
    'A+': 4.0, 'A': 4.0, 'A-': 3.7,
    'B+': 3.3, 'B': 3.0, 'B-': 2.7,
    'C+': 2.3, 'C': 2.0, 'C-': 1.7,
    'D+': 1.3, 'D': 1.0, 'F': 0.0
  };
  return gradeMap[grade] || 0.0;
};