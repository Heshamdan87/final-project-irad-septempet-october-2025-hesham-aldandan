require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Course = require('../models/Course');
const Grade = require('../models/Grade');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

const createSampleGrades = async () => {
  try {
    console.log('Creating sample grades...');

    // Get existing students and courses
    const students = await User.find({ role: 'student' });
    const courses = await Course.find({});

    console.log('Found students:', students.length);
    console.log('Found courses:', courses.length);

    if (students.length === 0 || courses.length === 0) {
      console.log('No students or courses found. Please run test-data.js first.');
      return;
    }

    console.log('Sample student:', students[0]);
    console.log('Sample course students:', courses[0].students);

    // Check if grades already exist
    const existingGrades = await Grade.find({});
    if (existingGrades.length > 0) {
      console.log('Sample grades already exist. Skipping creation.');
      return;
    }

    // Create sample grades
    const grades = [];

    // For each student, create grades for some courses (not necessarily enrolled ones for demo)
    for (const student of students.slice(0, 3)) { // Just create for first 3 students
      for (const course of courses.slice(0, 2)) { // Just create for first 2 courses
        // Create different types of final grades
        const letterGrades = ['A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D', 'F'];
        const randomGrade = letterGrades[Math.floor(Math.random() * letterGrades.length)];
        const semesters = ['Fall', 'Spring'];
        const randomSemester = semesters[Math.floor(Math.random() * semesters.length)];
        const randomYear = 2023 + Math.floor(Math.random() * 3); // 2023-2025

        grades.push({
          student: student._id,
          course: course._id,
          grade: randomGrade,
          semester: randomSemester,
          year: randomYear,
          credits: course.credits || 3,
          comments: `Final grade for ${course.title}`,
          gradedBy: course.teacher,
          gradedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) // Random date within last 30 days
        });
      }
    }

    if (grades.length > 0) {
      await Grade.insertMany(grades);
      console.log(`Created ${grades.length} sample grades`);
    } else {
      console.log('No grades to create - no enrolled students found');
    }

  } catch (error) {
    console.error('Error creating sample grades:', error);
  }
};

const run = async () => {
  await connectDB();
  await createSampleGrades();
  process.exit(0);
};

run();