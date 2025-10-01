require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Course = require('../models/Course');

const connectDB = async () => {
  const conn = await mongoose.connect(process.env.MONGODB_URI);
  console.log('MongoDB Connected');
};

const addTestData = async () => {
  try {
    console.log('Adding test data...');

    // Add test users (skip if they exist)
    const users = [
      {
        firstName: 'Alice',
        lastName: 'Johnson',
        email: 'alice.johnson@test.com',
        username: 'alicejohnson',
        password: 'password123',
        role: 'student',
        major: 'Computer Science',
        academicYear: 'Junior',
        gpa: 3.5,
        isEmailVerified: true
      },
      {
        firstName: 'Bob',
        lastName: 'Wilson',
        email: 'bob.wilson@test.com',
        username: 'bobwilson',
        password: 'password123',
        role: 'student',
        major: 'Mathematics',
        academicYear: 'Sophomore',
        gpa: 3.2,
        isEmailVerified: true
      },
      {
        firstName: 'Charlie',
        lastName: 'Brown',
        email: 'charlie.brown@test.com',
        username: 'charliebrown',
        password: 'password123',
        role: 'student',
        major: 'Computer Science',
        academicYear: 'Senior',
        gpa: 3.8,
        isEmailVerified: true
      }
    ];

    for (const userData of users) {
      const existing = await User.findOne({ email: userData.email });
      if (!existing) {
        await User.create(userData);
        console.log('Created user:', userData.email);
      } else {
        console.log('User already exists:', userData.email);
      }
    }

    // Get teachers and students
    const teachers = await User.find({ role: 'admin' }); // Use admin as teacher
    const students = await User.find({ role: 'student' });

    console.log(`Found ${teachers.length} admins and ${students.length} students`);

    // Add test courses
    const courses = [
      {
        courseCode: 'CS101',
        title: 'Introduction to Computer Science',
        description: 'Basic concepts of computer science and programming',
        credits: 3,
        department: 'Computer Science',
        teacher: teachers.length > 0 ? teachers[0]._id : null,
        students: students.length >= 2 ? [{ student: students[0]._id }, { student: students[2]._id }] : [],
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
        courseCode: 'MATH201',
        title: 'Calculus II',
        description: 'Advanced calculus concepts including integration and series',
        credits: 4,
        department: 'Mathematics',
        teacher: teachers.length > 0 ? teachers[0]._id : null,
        students: students.length > 0 ? [{ student: students[0]._id }] : [],
        schedule: {
          days: ['Tuesday', 'Thursday'],
          startTime: '14:00',
          endTime: '15:30',
          room: 'MATH201'
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

    for (const courseData of courses) {
      const existing = await Course.findOne({ courseCode: courseData.courseCode });
      if (!existing) {
        await Course.create(courseData);
        console.log('Created course:', courseData.courseCode);
      } else {
        console.log('Course already exists:', courseData.courseCode);
      }
    }

    console.log('Test data setup complete!');
  } catch (error) {
    console.error('Error:', error);
  }
};

const run = async () => {
  await connectDB();
  await addTestData();
  process.exit(0);
};

run();

