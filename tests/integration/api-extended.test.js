const request = require('supertest');
const app = require('../../src/app');
const db = require('../../src/database');
const { generateTestUser, generateEdgeCases } = require('../utils/testDataGenerator');

describe('Extended API Tests', () => {
  let testUsers = [];

  afterAll(async () => {
    for (const email of testUsers) {
      await db.query('DELETE FROM users WHERE email = $1', [email]);
    }
    await db.pool.end();
  });

  describe('Registration Edge Cases', () => {
    test('should reject duplicate email registration', async () => {
      const user = generateTestUser();
      testUsers.push(user.email);

      await request(app).post('/api/auth/register').send({
        email: user.email,
        password: user.password,
        name: user.name
      }).expect(201);

      await request(app).post('/api/auth/register').send({
        email: user.email,
        password: 'Different123!',
        name: 'Different Name'
      }).expect(400);
    });

    test('should reject registration with missing name', async () => {
      const user = generateTestUser();
      await request(app).post('/api/auth/register').send({
        email: user.email,
        password: user.password
      }).expect(400);
    });

    test('should reject registration with missing email', async () => {
      const user = generateTestUser();
      await request(app).post('/api/auth/register').send({
        name: user.name,
        password: user.password
      }).expect(400);
    });

    test('should reject registration with missing password', async () => {
      const user = generateTestUser();
      await request(app).post('/api/auth/register').send({
        email: user.email,
        name: user.name
      }).expect(400);
    });

    test('should validate email format - invalid format 1', async () => {
      await request(app).post('/api/auth/register').send({
        email: 'notanemail',
        password: 'Password123!',
        name: 'Test User'
      }).expect(400);
    });

    test('should validate email format - invalid format 2', async () => {
      await request(app).post('/api/auth/register').send({
        email: '@example.com',
        password: 'Password123!',
        name: 'Test User'
      }).expect(400);
    });

    test('should validate email format - invalid format 3', async () => {
      await request(app).post('/api/auth/register').send({
        email: 'test@',
        password: 'Password123!',
        name: 'Test User'
      }).expect(400);
    });

    test('should enforce minimum password length - 7 chars', async () => {
      const user = generateTestUser();
      await request(app).post('/api/auth/register').send({
        email: user.email,
        password: 'Pass12!',
        name: user.name
      }).expect(400);
    });

    test('should enforce minimum password length - 6 chars', async () => {
      const user = generateTestUser();
      await request(app).post('/api/auth/register').send({
        email: user.email,
        password: 'Pas1!',
        name: user.name
      }).expect(400);
    });

    test('should accept valid 8 character password', async () => {
      const user = generateTestUser();
      testUsers.push(user.email);
      
      await request(app).post('/api/auth/register').send({
        email: user.email,
        password: 'Passw0rd',
        name: user.name
      }).expect(201);
    });

    test('should accept email with plus sign', async () => {
      const user = generateTestUser();
      const email = `test+tag${Date.now()}@example.com`;
      testUsers.push(email);
      
      await request(app).post('/api/auth/register').send({
        email: email,
        password: user.password,
        name: user.name
      }).expect(201);
    });

    test('should accept email with dots', async () => {
      const user = generateTestUser();
      const email = `test.name${Date.now()}@example.com`;
      testUsers.push(email);
      
      await request(app).post('/api/auth/register').send({
        email: email,
        password: user.password,
        name: user.name
      }).expect(201);
    });

    test('should handle long email addresses', async () => {
      const user = generateTestUser();
      const email = `verylongemailaddress${Date.now()}@example.com`;
      testUsers.push(email);
      
      await request(app).post('/api/auth/register').send({
        email: email,
        password: user.password,
        name: user.name
      }).expect(201);
    });

    test('should handle special characters in name', async () => {
      const user = generateTestUser();
      testUsers.push(user.email);
      
      await request(app).post('/api/auth/register').send({
        email: user.email,
        password: user.password,
        name: "O'Brien-Smith"
      }).expect(201);
    });

    test('should handle unicode characters in name', async () => {
      const user = generateTestUser();
      testUsers.push(user.email);
      
      await request(app).post('/api/auth/register').send({
        email: user.email,
        password: user.password,
        name: "José María"
      }).expect(201);
    });
  });

  describe('Login Edge Cases', () => {
    let registeredUser;
    let registeredToken;

    beforeAll(async () => {
      registeredUser = generateTestUser();
      testUsers.push(registeredUser.email);
      
      const response = await request(app).post('/api/auth/register').send({
        email: registeredUser.email,
        password: registeredUser.password,
        name: registeredUser.name
      });
      registeredToken = response.body.token;
    });

    test('should reject login with wrong password', async () => {
      await request(app).post('/api/auth/login').send({
        email: registeredUser.email,
        password: 'WrongPassword123!'
      }).expect(401);
    });

    test('should reject login with non-existent email', async () => {
      await request(app).post('/api/auth/login').send({
        email: 'nonexistent@example.com',
        password: 'Password123!'
      }).expect(401);
    });

    test('should reject login with missing email', async () => {
      await request(app).post('/api/auth/login').send({
        password: 'Password123!'
      }).expect(400);
    });

    test('should reject login with missing password', async () => {
      await request(app).post('/api/auth/login').send({
        email: registeredUser.email
      }).expect(400);
    });

    test('should reject login with empty email', async () => {
      await request(app).post('/api/auth/login').send({
        email: '',
        password: 'Password123!'
      }).expect(400);
    });

    test('should reject login with empty password', async () => {
      await request(app).post('/api/auth/login').send({
        email: registeredUser.email,
        password: ''
      }).expect(400);
    });

    test('should be case-sensitive for passwords', async () => {
      await request(app).post('/api/auth/login').send({
        email: registeredUser.email,
        password: registeredUser.password.toUpperCase()
      }).expect(401);
    });

    test('should allow multiple login attempts with valid credentials', async () => {
      await request(app).post('/api/auth/login').send({
        email: registeredUser.email,
        password: registeredUser.password
      }).expect(200);

      await request(app).post('/api/auth/login').send({
        email: registeredUser.email,
        password: registeredUser.password
      }).expect(200);
    });

    test('should return token on successful login', async () => {
      const response = await request(app).post('/api/auth/login').send({
        email: registeredUser.email,
        password: registeredUser.password
      }).expect(200);

      expect(response.body).toHaveProperty('token');
      expect(typeof response.body.token).toBe('string');
      expect(response.body.token.length).toBeGreaterThan(20);
    });

    test('should return user data on successful login', async () => {
      const response = await request(app).post('/api/auth/login').send({
        email: registeredUser.email,
        password: registeredUser.password
      }).expect(200);

      expect(response.body.user).toHaveProperty('email', registeredUser.email);
      expect(response.body.user).toHaveProperty('name');
      expect(response.body.user).not.toHaveProperty('password');
    });
  });

  describe('Profile Management Edge Cases', () => {
    let user;
    let token;

    beforeAll(async () => {
      user = generateTestUser();
      testUsers.push(user.email);
      
      const response = await request(app).post('/api/auth/register').send({
        email: user.email,
        password: user.password,
        name: user.name
      });
      token = response.body.token;
    });

    test('should reject profile access without authorization header', async () => {
      await request(app).get('/api/users/profile').expect(401);
    });

    test('should reject profile access with malformed token', async () => {
      await request(app)
        .get('/api/users/profile')
        .set('Authorization', 'InvalidToken')
        .expect(401);
    });

    test('should reject profile access with invalid token format', async () => {
      await request(app)
        .get('/api/users/profile')
        .set('Authorization', 'Bearer invalid')
        .expect(403);
    });

    test('should allow partial profile updates - name only', async () => {
      const response = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Updated Name' })
        .expect(200);

      expect(response.body.name).toBe('Updated Name');
    });

    test('should allow partial profile updates - phone only', async () => {
      const response = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${token}`)
        .send({ phone: '+1234567890' })
        .expect(200);

      expect(response.body.phone).toBe('+1234567890');
    });

    test('should return updated profile data', async () => {
      const response = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Test Update' })
        .expect(200);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('email');
      expect(response.body).not.toHaveProperty('password');
    });

    test('should handle empty update request', async () => {
      await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${token}`)
        .send({})
        .expect(200);
    });

    test('should preserve other fields during partial update', async () => {
      const originalProfile = await request(app)
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${token}`);

      await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'New Name' });

      const updatedProfile = await request(app)
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${token}`);

      expect(updatedProfile.body.email).toBe(originalProfile.body.email);
    });
  });

  describe('API Response Format', () => {
    test('should return JSON content type for auth endpoints', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@test.com', password: 'test' });

      expect(response.type).toBe('application/json');
    });

    test('should return proper error structure', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({ email: 'invalid' })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    test('should handle OPTIONS requests', async () => {
      await request(app)
        .options('/api/auth/login')
        .expect(204);
    });
  });

  describe('Health and Status', () => {
    test('should return health check status', async () => {
      const response = await request(app).get('/health').expect(200);
      expect(response.body.status).toBe('ok');
    });

    test('should return timestamp in health check', async () => {
      const response = await request(app).get('/health').expect(200);
      expect(response.body.timestamp).toBeDefined();
    });

    test('should handle 404 for non-existent routes', async () => {
      await request(app).get('/api/nonexistent').expect(404);
    });
  });
});
