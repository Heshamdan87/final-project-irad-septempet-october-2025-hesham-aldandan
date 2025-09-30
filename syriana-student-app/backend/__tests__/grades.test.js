const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');

describe('Grades API', () => {
  let adminToken;
  let teacherToken;
  let studentToken;
  let testStudentId;
  let testCourseId;
  let createdGradeId;

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

    // Get test data IDs
    const User = require('../models/User');
    const Course = require('../models/Course');
    
    const student = await User.findOne({ email: 'student1@syriana.edu' });
    const course = await Course.findOne({ courseCode: 'CS101' });
    
    testStudentId = student._id;
    testCourseId = course._id;
  });

  afterAll(async () => {
    // Close database connection
    await mongoose.connection.close();
  });

  describe('GET /api/grades', () => {
    it('should return all grades for admin', async () => {
      const response = await request(app)
        .get('/api/grades')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should return grades for teacher', async () => {
      const response = await request(app)
        .get('/api/grades')
        .set('Authorization', `Bearer ${teacherToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
    });

    it('should return student grades for student', async () => {
      const response = await request(app)
        .get('/api/grades')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .get('/api/grades');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('POST /api/grades', () => {
    it('should create new grade for admin', async () => {
      const newGrade = {
        student: testStudentId,
        course: testCourseId,
        grade: 'A',
        semester: 'Fall',
        year: 2025,
        credits: 3,
        comments: 'Excellent performance'
      };

      const response = await request(app)
        .post('/api/grades')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(newGrade);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('grade', 'A');
      expect(response.body.data).toHaveProperty('student');
      expect(response.body.data).toHaveProperty('course');
      
      createdGradeId = response.body.data._id;
    });

    it('should create new grade for teacher', async () => {
      const newGrade = {
        student: testStudentId,
        course: testCourseId,
        grade: 'B+',
        semester: 'Spring',
        year: 2025,
        credits: 3,
        comments: 'Good work'
      };

      const response = await request(app)
        .post('/api/grades')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send(newGrade);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('grade', 'B+');
    });

    it('should return 403 for student trying to create grade', async () => {
      const newGrade = {
        student: 'someStudentId',
        course: 'someCourseId',
        grade: 'A',
        semester: 'Fall'
      };

      const response = await request(app)
        .post('/api/grades')
        .set('Authorization', `Bearer ${studentToken}`)
        .send(newGrade);

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('PUT /api/grades/:id', () => {
    it('should update grade for admin', async () => {
      const updateData = {
        grade: 'A+',
        comments: 'Updated grade'
      };

      const response = await request(app)
        .put(`/api/grades/${createdGradeId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('grade', 'A+');
      expect(response.body.data).toHaveProperty('comments', 'Updated grade');
    });

    it('should update grade for teacher', async () => {
      const updateData = {
        grade: 'A-',
        comments: 'Updated by teacher'
      };

      const response = await request(app)
        .put(`/api/grades/${createdGradeId}`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('grade', 'A-');
    });

    it('should return 403 for student trying to update grade', async () => {
      const response = await request(app)
        .put('/api/grades/someGradeId')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ grade: 'B' });

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('DELETE /api/grades/:id', () => {
    it('should delete grade for admin', async () => {
      const response = await request(app)
        .delete(`/api/grades/${createdGradeId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);

      // Verify grade is deleted
      const verifyResponse = await request(app)
        .get(`/api/grades/${createdGradeId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(verifyResponse.status).toBe(404);
    });

    it('should return 403 for student trying to delete grade', async () => {
      const response = await request(app)
        .delete('/api/grades/someGradeId')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('success', false);
    });
  });
});
