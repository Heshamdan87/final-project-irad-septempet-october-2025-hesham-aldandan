const User = require('../models/User');
const Course = require('../models/Course');
const Grade = require('../models/Grade');


exports.getStudentDashboard = async (req, res) => {
  try {
    const userId = req.user._id;


    const enrolledCourses = await Course.find({ 'students.student': userId })
      .select('name code description credits semester year');


    const grades = await Grade.find({ student: userId })
      .populate('course', 'name code')
      .select('course grade semester year credits');


    let totalCredits = 0;
    let totalPoints = 0;

    grades.forEach(grade => {
      const gradePoint = getGradePoint(grade.grade);
      totalCredits += grade.credits || 0;
      totalPoints += gradePoint * (grade.credits || 0);
    });

    const gpa = totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : 0;


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


exports.getAdminDashboard = async (req, res) => {
  try {

    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalAdmins = await User.countDocuments({ role: 'admin' });
    const totalUsers = totalStudents + totalAdmins;


    const totalCourses = await Course.countDocuments();


    const totalGrades = await Grade.countDocuments();


    const recentUsers = await User.find()
      .select('firstName lastName email role createdAt')
      .sort({ createdAt: -1 })
      .limit(5);


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


exports.getStats = async (req, res) => {
  try {
    const stats = {
      totalUsers: await User.countDocuments(),
      totalCourses: await Course.countDocuments(),
      totalGrades: await Grade.countDocuments(),
      activeStudents: await User.countDocuments({ role: 'student' })
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


exports.getRecentActivity = async (req, res) => {
  try {

    const recentUsers = await User.find()
      .select('firstName lastName email role createdAt')
      .sort({ createdAt: -1 })
      .limit(10);


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


exports.getUpcomingEvents = async (req, res) => {
  try {

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


const getGradePoint = (grade) => {
  const gradeMap = {
    'A+': 4.0, 'A': 4.0, 'A-': 3.7,
    'B+': 3.3, 'B': 3.0, 'B-': 2.7,
    'C+': 2.3, 'C': 2.0, 'C-': 1.7,
    'D+': 1.3, 'D': 1.0, 'F': 0.0
  };
  return gradeMap[grade] || 0.0;
};



