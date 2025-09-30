require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Course = require('../models/Course');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

const createTestData = async () => {
  try {
    console.log('Creating test data...');

    // Check if test data already exists
    const existingUsers = await User.find({ email: { $in: ['admin@syriana.edu', 'teacher1@syriana.edu', 'student1@syriana.edu'] } });
    if (existingUsers.length > 0) {
      console.log('Test data already exists. Skipping creation.');
      return;
    }

    // Create test users
    const users = [
      {
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@syriana.edu',
        password: 'admin123',
        role: 'admin',
        isEmailVerified: true
      },
      {
        firstName: 'Teacher',
        lastName: 'One',
        email: 'teacher1@syriana.edu',
        password: 'teacher123',
        role: 'teacher',
        department: 'Computer Science',
        isEmailVerified: true
      },
      {
        firstName: 'Student',
        lastName: 'One',
        email: 'student1@syriana.edu',
        password: 'student123',
        role: 'student',
        major: 'Computer Science',
        academicYear: 'Junior',
        gpa: 3.5,
        isEmailVerified: true
      }
    ];

    // Create test users one by one to ensure pre-save middleware runs
    const createdUsers = [];
    for (const userData of users) {
      const user = await User.create(userData);
      createdUsers.push(user);
    }
    console.log('Users created:', createdUsers.length);

    // Get teacher and student IDs
    const teachers = createdUsers.filter(u => u.role === 'teacher');
    const students = createdUsers.filter(u => u.role === 'student');

    // Check if courses already exist
    const existingCourses = await Course.find({ courseCode: { $in: ['CS101', 'CS201'] } });
    if (existingCourses.length > 0) {
      console.log('Courses already exist. Skipping creation.');
      return;
    }

    // Create test courses
    const courses = [
      {
        courseCode: 'CS101',
        title: 'Introduction to Computer Science',
        description: 'Basic concepts of computer science and programming',
        credits: 3,
        department: 'Computer Science',
        teacher: teachers[0]._id,
        students: [{ student: students[0]._id }],
        schedule: {
          days: ['Monday', 'Wednesday'],
          startTime: '10:00',
          endTime: '11:30',
          room: 'CS101'
        },
        semester: 'Fall',
        year: 2025,
        capacity: 30,
        enrollmentStart: new Date('2025-09-01'),
        enrollmentEnd: new Date('2025-09-15'),
        courseStart: new Date('2025-09-16'),
        courseEnd: new Date('2025-12-20')
      },
      {
        courseCode: 'CS201',
        title: 'Data Structures and Algorithms',
        description: 'Advanced programming concepts and algorithm design',
        credits: 4,
        department: 'Computer Science',
        teacher: teachers[0]._id,
        students: [{ student: students[0]._id }],
        schedule: {
          days: ['Tuesday', 'Thursday'],
          startTime: '14:00',
          endTime: '15:30',
          room: 'CS201'
        },
        semester: 'Fall',
        year: 2025,
        capacity: 25,
        enrollmentStart: new Date('2025-09-01'),
        enrollmentEnd: new Date('2025-09-15'),
        courseStart: new Date('2025-09-16'),
        courseEnd: new Date('2025-12-20')
      }
    ];

    const createdCourses = await Course.insertMany(courses);
    console.log('Courses created:', createdCourses.length);

    console.log('Test data created successfully!');
  } catch (error) {
    console.error('Error creating test data:', error);
  }
};

// Export the function for use in tests
module.exports = { createTestData };

// Only run if this file is executed directly
if (require.main === module) {
  run();
}