require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Course = require('../models/Course');

const verify = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to new database');

    const userCount = await User.countDocuments();
    const courseCount = await Course.countDocuments();
    console.log('New Database Verification:');
    console.log('Users:', userCount);
    console.log('Courses:', courseCount);

    const users = await User.find({}, 'firstName lastName email role').limit(5);
    console.log('Sample Users:');
    users.forEach(u => console.log(`- ${u.firstName} ${u.lastName} (${u.email}) - ${u.role}`));

    const courses = await Course.find({}, 'courseCode title').limit(3);
    console.log('Sample Courses:');
    courses.forEach(c => console.log(`- ${c.courseCode}: ${c.title}`));

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

verify();