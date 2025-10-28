const request = require('supertest');
const app = require('../../src/app');
const db = require('../../src/database');
const { generateTestUser } = require('../utils/testDataGenerator');

describe('API Integration Tests', () => {
  let testUser;
  let authToken;

  beforeAll(async () => {
    testUser = generateTestUser();
  });

  afterAll(async () => {
    if (testUser.email) {
      await db.query('DELETE FROM users WHERE email = $1', [testUser.email]);
    }
    await db.pool.end();
  });

  describe('Authentication', () => {
    test('should register a new user', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: testUser.email,
          password: testUser.password,
          name: testUser.name
        })
        .expect(201);

      expect(response.body).toHaveProperty('token');
      expect(response.body.user.email).toBe(testUser.email);
      authToken = response.body.token;
    });

    test('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        })
        .expect(200);

      expect(response.body).toHaveProperty('token');
    });

    test('should reject invalid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'wrongpassword'
        })
        .expect(401);

      expect(response.body.error).toBe('Invalid credentials');
    });
  });

  describe('User Management', () => {
    test('should get user profile with valid token', async () => {
      const response = await request(app)
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.email).toBe(testUser.email);
    });

    test('should reject unauthorized access', async () => {
      await request(app)
        .get('/api/users/profile')
        .expect(401);
    });
  });
});