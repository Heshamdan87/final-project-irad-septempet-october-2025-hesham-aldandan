const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');

describe('Users API', () => {
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
    }    // Seed test data
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

  describe('GET /api/users', () => {
    it('should return all users for admin', async () => {
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .get('/api/users');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('GET /api/users/:id', () => {
    it('should return user by ID for admin', async () => {
      // First get a user ID from the list
      const usersResponse = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${adminToken}`);

      const userId = usersResponse.body.data[0]._id;

      const response = await request(app)
        .get(`/api/users/${userId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('_id', userId);
    });

    it('should return 404 for non-existent user', async () => {
      const response = await request(app)
        .get('/api/users/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('PUT /api/users/:id', () => {
    it('should update user for admin', async () => {
      // First get a user ID from the list
      const usersResponse = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${adminToken}`);

      const userId = usersResponse.body.data[0]._id;

      const updateData = {
        firstName: 'Updated',
        lastName: 'User'
      };

      const response = await request(app)
        .put(`/api/users/${userId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('firstName', 'Updated');
      expect(response.body.data).toHaveProperty('lastName', 'User');
    });

    it('should allow student to update their own profile', async () => {
      const updateData = {
        major: 'Self Updated Major'
      };

      const response = await request(app)
        .put('/api/auth/profile')
        .set('Authorization', `Bearer ${studentToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
    });
  });

  describe('POST /api/users', () => {
    it('should create user for admin', async () => {
      const newUser = {
        firstName: 'Test',
        lastName: 'User',
        email: 'testuser@test.com',
        password: 'password123',
        role: 'student'
      };

      const response = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(newUser);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('email', 'testuser@test.com');
    });


  });

  describe('DELETE /api/users/:id', () => {
    it('should delete user for admin', async () => {
      // First create a test user to delete
      const createResponse = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          firstName: 'Delete',
          lastName: 'Me',
          email: 'deleteme@test.com',
          password: 'password123',
          role: 'student'
        });

      const userId = createResponse.body.data._id;

      const response = await request(app)
        .delete(`/api/users/${userId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
    });

  });

  describe('Role-based access control', () => {
    it('should return 403 for student trying to access admin routes', async () => {
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('success', false);
    });
  });
});
