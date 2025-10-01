const User = require('../models/User');
const bcrypt = require('bcryptjs');


exports.createUser = async (req, res) => {
  try {
    const { firstName, lastName, email, password, role, phone, dateOfBirth, address, major, department, academicYear } = req.body;


    const allowedRoles = ['student', 'admin'];
    if (role && !allowedRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Only student and admin roles are allowed.'
      });
    }


    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }


    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);


    const user = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role: role || 'student',
      phone,
      dateOfBirth,
      address,
      major,
      department,
      academicYear
    });

    res.status(201).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating user'
    });
  }
};


exports.getStudents = async (req, res) => {
  try {
    const { role, ...otherParams } = req.query;

    const filter = role ? { role } : {};

    const students = await User.find(filter).select('-password');
    res.json({
      success: true,
      count: students.length,
      data: students
    });
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching students'
    });
  }
};


exports.getStudent = async (req, res) => {
  try {
    const student = await User.findById(req.params.id).select('-password');
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    res.json({
      success: true,
      data: student
    });
  } catch (error) {
    console.error('Error fetching student:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching student'
    });
  }
};


exports.updateStudent = async (req, res) => {
  try {
    const updates = req.body;
    const student = await User.findById(req.params.id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }


    Object.keys(updates).forEach(key => {
      if (updates[key] !== undefined) {
        student[key] = updates[key];
      }
    });

    await student.save();
    res.json({
      success: true,
      data: student
    });
  } catch (error) {
    console.error('Error updating student:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating student'
    });
  }
};


exports.deleteStudent = async (req, res) => {
  try {
    const student = await User.findByIdAndDelete(req.params.id);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting student:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting student'
    });
  }
};



