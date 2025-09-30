const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');

describe('Courses API', () => {
  let adminToken;
  let teacherToken;
  let studentToken;

  beforeAll(async () => {
    // Connect to test database
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/syriana-test', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
    }

    // Clear test database collections
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }

    // Seed test data
    const testDataScript = require('../scripts/test-data');
    await testDataScript.createTestData();

    // Get tokens for different user types
    const adminLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@syriana.edu', password: 'admin123' });
    adminToken = adminLogin.body.data.token;

    const teacherLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'teacher1@syriana.edu', password: 'teacher123' });
    teacherToken = teacherLogin.body.data.token;

    const studentLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'student1@syriana.edu', password: 'student123' });
    studentToken = studentLogin.body.data.token;
  });

  afterAll(async () => {
    // Close database connection
    await mongoose.connection.close();
  });

  describe('GET /api/courses', () => {
    it('should return all courses for admin', async () => {
      const response = await request(app)
        .get('/api/courses')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should return courses for teacher', async () => {
      const response = await request(app)
        .get('/api/courses')
        .set('Authorization', `Bearer ${teacherToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
    });

    it('should return courses for student', async () => {
      const response = await request(app)
        .get('/api/courses')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .get('/api/courses');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('GET /api/courses/:id', () => {
    it('should return course by ID', async () => {
      // First get a course ID from the list
      const coursesResponse = await request(app)
        .get('/api/courses')
        .set('Authorization', `Bearer ${adminToken}`);

      const courseId = coursesResponse.body.data[0]._id;

      const response = await request(app)
        .get(`/api/courses/${courseId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('_id', courseId);
      expect(response.body.data).toHaveProperty('courseCode');
      expect(response.body.data).toHaveProperty('title');
    });

    it('should return 404 for non-existent course', async () => {
      const response = await request(app)
        .get('/api/courses/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('POST /api/courses', () => {
    it('should create new course for admin', async () => {
      // Get teacher ID for the course
      const User = require('../models/User');
      const teacher = await User.findOne({ email: 'teacher1@syriana.edu' });

      const newCourse = {
        courseCode: 'TEST101',
        title: 'Test Course',
        description: 'A test course for API testing',
        credits: 3,
        department: 'Computer Science',
        teacher: teacher._id,
        schedule: {
          days: ['Monday', 'Wednesday'],
          startTime: '10:00',
          endTime: '11:30',
          room: 'TEST101'
        },
        semester: 'Fall',
        year: 2025,
        capacity: 30,
        enrollmentStart: new Date('2025-09-01'),
        enrollmentEnd: new Date('2025-09-15'),
        courseStart: new Date('2025-09-16'),
        courseEnd: new Date('2025-12-20')
      };

      const response = await request(app)
        .post('/api/courses')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(newCourse);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('courseCode', 'TEST101');
      expect(response.body.data).toHaveProperty('title', 'Test Course');
    });

    it('should create course for teacher', async () => {
      const newCourse = {
        courseCode: 'TCH101',
        title: 'Teacher Test Course',
        description: 'Created by teacher',
        credits: 3,
        department: 'Computer Science',
        schedule: {
          days: ['Monday', 'Wednesday'],
          startTime: '10:00',
          endTime: '11:30',
          room: 'TCH101'
        },
        semester: 'Fall',
        year: 2025,
        capacity: 30,
        enrollmentStart: new Date('2025-09-01'),
        enrollmentEnd: new Date('2025-09-15'),
        courseStart: new Date('2025-09-16'),
        courseEnd: new Date('2025-12-20')
      };

      const response = await request(app)
        .post('/api/courses')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send(newCourse);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('courseCode', 'TCH101');
      expect(response.body.data).toHaveProperty('title', 'Teacher Test Course');
    });
  });
});