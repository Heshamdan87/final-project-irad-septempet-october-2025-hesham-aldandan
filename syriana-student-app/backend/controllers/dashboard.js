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

// Count total number of students
exports.getStudentCount = async (req, res) => {
  try {
    const totalStudents = await User.countDocuments({ role: 'student' });

    // Optional: Get students by year/semester if needed
    const { year, semester } = req.query;
    let query = { role: 'student' };

    if (year) {
      query.createdAt = { $gte: new Date(`${year}-01-01`), $lt: new Date(`${parseInt(year) + 1}-01-01`) };
    }

    const filteredCount = await User.countDocuments(query);

    res.json({
      success: true,
      data: {
        totalStudents,
        filteredCount: year ? filteredCount : totalStudents
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

// Statistics regarding pass/fail rates and grade distributions
exports.getGradeStatistics = async (req, res) => {
  try {
    const { semester, year, course } = req.query;

    // Build query for filtering grades
    let query = {};
    if (semester) {
      query.semester = semester;
    }
    if (year) {
      query.year = parseInt(year);
    }
    if (course) {
      query.course = course;
    }

    const grades = await Grade.find(query).select('grade');

    if (grades.length === 0) {
      return res.json({
        success: true,
        data: {
          totalGrades: 0,
          passCount: 0,
          failCount: 0,
          passRate: 0,
          failRate: 0,
          gradeDistribution: {},
          averageGPA: 0,
          filters: { semester, year, course }
        }
      });
    }

    // Calculate pass/fail statistics
    let passCount = 0;
    let failCount = 0;
    let totalPoints = 0;
    let totalCredits = 0;
    const gradeDistribution = {};

    grades.forEach((gradeDoc) => {
      const { grade } = gradeDoc;
      const gradePoint = getGradePoint(grade);

      // Count grade distribution
      gradeDistribution[grade] = (gradeDistribution[grade] || 0) + 1;

      // Calculate pass/fail (assuming D- and above is passing)
      if (gradePoint >= 1.0) {
        passCount++;
      } else {
        failCount++;
      }

      // For GPA calculation (assuming 3 credits per course if not specified)
      totalPoints += gradePoint * 3;
      totalCredits += 3;
    });

    const totalGrades = grades.length;
    const passRate = ((passCount / totalGrades) * 100).toFixed(2);
    const failRate = ((failCount / totalGrades) * 100).toFixed(2);
    const averageGPA = totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : 0;

    res.json({
      success: true,
      data: {
        totalGrades,
        passCount,
        failCount,
        passRate: parseFloat(passRate),
        failRate: parseFloat(failRate),
        gradeDistribution,
        averageGPA: parseFloat(averageGPA),
        filters: { semester, year, course }
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

// Statistics regarding subjects/courses grades
exports.getSubjectGradeStatistics = async (req, res) => {
  try {
    const { semester, year } = req.query;

    // Build query for filtering
    let matchQuery = {};
    if (semester) {
      matchQuery.semester = semester;
    }
    if (year) {
      matchQuery.year = parseInt(year);
    }

    // Aggregate grades by course
    const subjectStats = await Grade.aggregate([
      { $match: matchQuery },
      {
        $lookup: {
          from: 'courses',
          localField: 'course',
          foreignField: '_id',
          as: 'courseInfo'
        }
      },
      { $unwind: '$courseInfo' },
      {
        $group: {
          _id: {
            courseId: '$course',
            courseName: '$courseInfo.name',
            courseCode: '$courseInfo.code'
          },
          grades: { $push: '$grade' },
          totalStudents: { $sum: 1 },
          averageGrade: { $avg: { $function: { body: `function(grade) { const points = {'A+':4.0,'A':4.0,'A-':3.7,'B+':3.3,'B':3.0,'B-':2.7,'C+':2.3,'C':2.0,'C-':1.7,'D+':1.3,'D':1.0,'F':0.0}; return points[grade] || 0; }`, args: ['$grade'], lang: 'js' } } }
        }
      },
      {
        $project: {
          _id: 0,
          courseId: '$_id.courseId',
          courseName: '$_id.courseName',
          courseCode: '$_id.courseCode',
          totalStudents: 1,
          averageGrade: { $round: ['$averageGrade', 2] },
          gradeDistribution: {
            $function: {
              body: `function(grades) { const dist = {}; grades.forEach(g => { dist[g] = (dist[g] || 0) + 1; }); return dist; }`,
              args: ['$grades'],
              lang: 'js'
            }
          },
          passRate: {
            $function: {
              body: `function(grades) { const passing = grades.filter(g => { const points = {'A+':4.0,'A':4.0,'A-':3.7,'B+':3.3,'B':3.0,'B-':2.7,'C+':2.3,'C':2.0,'C-':1.7,'D+':1.3,'D':1.0,'F':0.0}; return points[g] >= 1.0; }).length; return Math.round((passing / grades.length) * 100 * 100) / 100; }`,
              args: ['$grades'],
              lang: 'js'
            }
          }
        }
      },
      { $sort: { totalStudents: -1 } }
    ]);

    // Calculate overall statistics
    const totalSubjects = subjectStats.length;
    const totalEnrollments = subjectStats.reduce((sum, subject) => sum + subject.totalStudents, 0);
    const averagePassRate = totalSubjects > 0 ?
      subjectStats.reduce((sum, subject) => sum + subject.passRate, 0) / totalSubjects : 0;

    res.json({
      success: true,
      data: {
        summary: {
          totalSubjects,
          totalEnrollments,
          averagePassRate: Math.round(averagePassRate * 100) / 100
        },
        subjects: subjectStats,
        filters: { semester, year }
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

// Advanced student performance analytics
exports.getStudentPerformanceAnalytics = async (req, res) => {
  try {
    const { semester, year, minGPA, maxGPA } = req.query;

    // Get all students with their grades
    const students = await User.find({ role: 'student' })
      .select('firstName lastName studentId email createdAt');

    const studentAnalytics = [];

    for (const student of students) {
      let gradeQuery = { student: student._id };
      if (semester) {
        gradeQuery.semester = semester;
      }
      if (year) {
        gradeQuery.year = parseInt(year);
      }

      const grades = await Grade.find(gradeQuery)
        .populate('course', 'name code credits')
        .select('grade credits semester year');

      if (grades.length === 0) {
        continue;
      }

      // Calculate GPA for this student
      let totalPoints = 0;
      let totalCredits = 0;
      let passCount = 0;
      let failCount = 0;

      grades.forEach(grade => {
        const gradePoint = getGradePoint(grade.grade);
        const credits = grade.credits || 3;

        totalPoints += gradePoint * credits;
        totalCredits += credits;

        if (gradePoint >= 1.0) {
          passCount++;
        } else {
          failCount++;
        }
      });

      const gpa = totalCredits > 0 ? totalPoints / totalCredits : 0;

      // Filter by GPA range if specified
      if (minGPA && gpa < parseFloat(minGPA)) {
        continue;
      }
      if (maxGPA && gpa > parseFloat(maxGPA)) {
        continue;
      }

      studentAnalytics.push({
        studentId: student.studentId,
        studentName: `${student.firstName} ${student.lastName}`,
        email: student.email,
        totalCourses: grades.length,
        totalCredits,
        gpa: Math.round(gpa * 100) / 100,
        passCount,
        failCount,
        passRate: grades.length > 0 ? Math.round((passCount / grades.length) * 100 * 100) / 100 : 0,
        enrollmentDate: student.createdAt
      });
    }

    // Sort by GPA descending
    studentAnalytics.sort((a, b) => b.gpa - a.gpa);

    // Calculate class statistics
    const validGPAs = studentAnalytics.map(s => s.gpa).filter(g => g > 0);
    const averageClassGPA = validGPAs.length > 0 ?
      validGPAs.reduce((sum, gpa) => sum + gpa, 0) / validGPAs.length : 0;

    res.json({
      success: true,
      data: {
        summary: {
          totalStudents: studentAnalytics.length,
          averageClassGPA: Math.round(averageClassGPA * 100) / 100,
          topPerformer: studentAnalytics[0] || null,
          filters: { semester, year, minGPA, maxGPA }
        },
        students: studentAnalytics
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



