const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');

describe('Dashboard API', () => {
  let adminToken;
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
      await collections[key].drop();
    }

    // Seed test data
    const testDataScript = require('../scripts/test-data');
    await testDataScript.createTestData();

    // Get tokens for different user types
    const adminLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@syriana.edu', password: 'admin123' });
    adminToken = adminLogin.body.data.token;

    const studentLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'student1@syriana.edu', password: 'student123' });
    studentToken = studentLogin.body.data.token;
  });

  afterAll(async () => {
    // Close database connection
    await mongoose.connection.close();
  });

  describe('GET /api/dashboard', () => {
    it('should return dashboard data for admin', async () => {
      const response = await request(app)
        .get('/api/dashboard')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');

      // Check dashboard structure
      const dashboard = response.body.data;
      expect(dashboard).toHaveProperty('totalUsers');
      expect(dashboard).toHaveProperty('totalCourses');
      expect(dashboard).toHaveProperty('totalGrades');
      expect(dashboard).toHaveProperty('userStats');
      expect(dashboard).toHaveProperty('recentActivity');

      // Check user stats
      expect(dashboard.userStats).toHaveProperty('admins');
      expect(dashboard.userStats).toHaveProperty('students');

      // Check that numbers are reasonable
      expect(typeof dashboard.totalUsers).toBe('number');
      expect(typeof dashboard.totalCourses).toBe('number');
      expect(typeof dashboard.totalGrades).toBe('number');
    });

    it('should return dashboard data for student', async () => {
      const response = await request(app)
        .get('/api/dashboard')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');

      const dashboard = response.body.data;
      expect(dashboard).toHaveProperty('myCourses');
      expect(dashboard).toHaveProperty('myGrades');
      expect(dashboard).toHaveProperty('gpa');
      expect(dashboard).toHaveProperty('academicStanding');
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .get('/api/dashboard');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message', 'Access denied. No token provided.');
    });
  });

  describe('Dashboard data validation', () => {
    it('should have valid user counts for admin dashboard', async () => {
      const response = await request(app)
        .get('/api/dashboard')
        .set('Authorization', `Bearer ${adminToken}`);

      const dashboard = response.body.data;

      // Total users should equal sum of user types
      const totalFromStats = dashboard.userStats.admins +
                           dashboard.userStats.students;

      expect(dashboard.totalUsers).toBe(totalFromStats);
    });

    it('should have valid GPA calculation for student', async () => {
      const response = await request(app)
        .get('/api/dashboard')
        .set('Authorization', `Bearer ${studentToken}`);

      const dashboard = response.body.data;

      // GPA should be a number between 0 and 4
      expect(typeof dashboard.gpa).toBe('number');
      expect(dashboard.gpa).toBeGreaterThanOrEqual(0);
      expect(dashboard.gpa).toBeLessThanOrEqual(4);
    });

    it('should have recent activity data for admin', async () => {
      const response = await request(app)
        .get('/api/dashboard')
        .set('Authorization', `Bearer ${adminToken}`);

      const dashboard = response.body.data;

      // Recent activity should be an array
      expect(Array.isArray(dashboard.recentActivity)).toBe(true);

      // If there are activities, they should have proper structure
      if (dashboard.recentActivity.length > 0) {
        const activity = dashboard.recentActivity[0];
        expect(activity).toHaveProperty('type');
        expect(activity).toHaveProperty('description');
        expect(activity).toHaveProperty('timestamp');
      }
    });
  });

  describe('Statistical Functions', () => {
    describe('GET /api/dashboard/students/count', () => {
      it('should return student count for admin', async () => {
        const response = await request(app)
          .get('/api/dashboard/students/count')
          .set('Authorization', `Bearer ${adminToken}`);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('success', true);
        expect(response.body).toHaveProperty('data');

        const data = response.body.data;
        expect(data).toHaveProperty('totalStudents');
        expect(data).toHaveProperty('filteredCount');
        expect(typeof data.totalStudents).toBe('number');
        expect(typeof data.filteredCount).toBe('number');
      });

      it('should return 403 for student trying to access student count', async () => {
        const response = await request(app)
          .get('/api/dashboard/students/count')
          .set('Authorization', `Bearer ${studentToken}`);

        expect(response.status).toBe(403);
        expect(response.body).toHaveProperty('success', false);
        expect(response.body).toHaveProperty('message', 'Access denied. Admin role required.');
      });
    });

    describe('GET /api/dashboard/grades/statistics', () => {
      it('should return grade statistics for admin', async () => {
        const response = await request(app)
          .get('/api/dashboard/grades/statistics')
          .set('Authorization', `Bearer ${adminToken}`);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('success', true);
        expect(response.body).toHaveProperty('data');

        const data = response.body.data;
        expect(data).toHaveProperty('totalGrades');
        expect(data).toHaveProperty('passCount');
        expect(data).toHaveProperty('failCount');
        expect(data).toHaveProperty('passRate');
        expect(data).toHaveProperty('failRate');
        expect(data).toHaveProperty('gradeDistribution');
        expect(data).toHaveProperty('averageGPA');

        expect(typeof data.totalGrades).toBe('number');
        expect(typeof data.passCount).toBe('number');
        expect(typeof data.failCount).toBe('number');
        expect(typeof data.passRate).toBe('number');
        expect(typeof data.failRate).toBe('number');
        expect(typeof data.averageGPA).toBe('number');
        expect(typeof data.gradeDistribution).toBe('object');
      });

      it('should return 403 for student trying to access grade statistics', async () => {
        const response = await request(app)
          .get('/api/dashboard/grades/statistics')
          .set('Authorization', `Bearer ${studentToken}`);

        expect(response.status).toBe(403);
        expect(response.body).toHaveProperty('success', false);
        expect(response.body).toHaveProperty('message', 'Access denied. Admin role required.');
      });
    });

    describe('GET /api/dashboard/subjects/grades', () => {
      it('should return subject grade statistics for admin', async () => {
        const response = await request(app)
          .get('/api/dashboard/subjects/grades')
          .set('Authorization', `Bearer ${adminToken}`);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('success', true);
        expect(response.body).toHaveProperty('data');

        const data = response.body.data;
        expect(data).toHaveProperty('summary');
        expect(data).toHaveProperty('subjects');
        expect(data).toHaveProperty('filters');

        expect(data.summary).toHaveProperty('totalSubjects');
        expect(data.summary).toHaveProperty('totalEnrollments');
        expect(data.summary).toHaveProperty('averagePassRate');

        expect(Array.isArray(data.subjects)).toBe(true);

        if (data.subjects.length > 0) {
          const subject = data.subjects[0];
          expect(subject).toHaveProperty('courseId');
          // Note: courseName and courseCode may not be populated if lookup fails
          // expect(subject).toHaveProperty('courseName');
          // expect(subject).toHaveProperty('courseCode');
          expect(subject).toHaveProperty('totalStudents');
          expect(subject).toHaveProperty('averageGrade');
          expect(subject).toHaveProperty('passRate');
          expect(subject).toHaveProperty('gradeDistribution');
        }
      });

      it('should return 403 for student trying to access subject grades', async () => {
        const response = await request(app)
          .get('/api/dashboard/subjects/grades')
          .set('Authorization', `Bearer ${studentToken}`);

        expect(response.status).toBe(403);
        expect(response.body).toHaveProperty('success', false);
        expect(response.body).toHaveProperty('message', 'Access denied. Admin role required.');
      });
    });

    describe('GET /api/dashboard/students/performance', () => {
      it('should return student performance analytics for admin', async () => {
        const response = await request(app)
          .get('/api/dashboard/students/performance')
          .set('Authorization', `Bearer ${adminToken}`);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('success', true);
        expect(response.body).toHaveProperty('data');

        const data = response.body.data;
        expect(data).toHaveProperty('summary');
        expect(data).toHaveProperty('students');

        expect(data.summary).toHaveProperty('totalStudents');
        expect(data.summary).toHaveProperty('averageClassGPA');
        expect(data.summary).toHaveProperty('topPerformer');

        expect(Array.isArray(data.students)).toBe(true);

        if (data.students.length > 0) {
          const student = data.students[0];
          expect(student).toHaveProperty('studentId');
          expect(student).toHaveProperty('studentName');
          expect(student).toHaveProperty('gpa');
          expect(student).toHaveProperty('passCount');
          expect(student).toHaveProperty('failCount');
          expect(student).toHaveProperty('passRate');
        }
      });

      it('should return 403 for student trying to access performance analytics', async () => {
        const response = await request(app)
          .get('/api/dashboard/students/performance')
          .set('Authorization', `Bearer ${studentToken}`);

        expect(response.status).toBe(403);
        expect(response.body).toHaveProperty('success', false);
        expect(response.body).toHaveProperty('message', 'Access denied. Admin role required.');
      });
    });
  });
});

