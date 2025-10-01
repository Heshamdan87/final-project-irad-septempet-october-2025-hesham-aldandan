const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');

describe('Auth API', () => {
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
  });

  afterAll(async () => {
    // Close database connection
    await mongoose.connection.close();
  });

  describe('POST /api/auth/login', () => {
    it('should login with valid admin credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@syriana.edu',
          password: 'admin123'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data.user).toHaveProperty('role', 'admin');
    });

    it('should login with valid student credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'student1@syriana.edu',
          password: 'student123'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data.user).toHaveProperty('role', 'student');
    });

    it('should reject login with invalid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'invalid@syriana.edu',
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message', 'Invalid credentials');
    });

    it('should return 400 for missing email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          password: 'admin123'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
    });

    it('should return 400 for missing password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@syriana.edu'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('GET /api/auth/profile', () => {
    let adminToken;

    beforeAll(async () => {
      // Get admin token for authenticated requests
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@syriana.edu',
          password: 'admin123'
        });
      adminToken = loginResponse.body.data.token;
    });

    it('should get user profile with valid token', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data.user).toHaveProperty('email', 'admin@syriana.edu');
    });

    it('should return 401 without token', async () => {
      const response = await request(app)
        .get('/api/auth/profile');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message', 'Access denied. No token provided.');
    });

    it('should return 401 with invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', 'Bearer invalidtoken');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('success', false);
    });
  });
});
