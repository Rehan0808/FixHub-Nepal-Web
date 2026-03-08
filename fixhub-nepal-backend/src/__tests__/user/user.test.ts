import request from 'supertest';
import app from '../../test-app';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import User from '../../models/User';

describe('User API', () => {
  let userId: string;
  let adminToken: string;
  const testEmail = 'usertest-newuser@fixhub.com';

  beforeAll(async () => {
    // Clean up any leftover test user from previous runs
    await User.deleteOne({ email: testEmail });

    // Create an admin user for the "get all users" test (requires admin auth)
    const hashedPassword = await bcrypt.hash('admin123', 10);
    let adminUser = await User.findOne({ email: 'usertest-admin@fixhub.com' });
    if (!adminUser) {
      adminUser = await User.create({
        fullName: 'User Test Admin',
        email: 'usertest-admin@fixhub.com',
        password: hashedPassword,
        role: 'admin',
        phone: '9876543210',
      });
    } else {
      adminUser.password = hashedPassword;
      adminUser.role = 'admin';
      await adminUser.save();
    }
    adminToken = jwt.sign(
      { _id: adminUser._id, email: adminUser.email, fullName: adminUser.fullName, role: 'admin' },
      process.env.SECRET as string,
      { expiresIn: '1d' }
    );
  });

  afterAll(async () => {
    // Clean up test data
    await User.deleteOne({ email: testEmail });
    await User.deleteOne({ email: 'usertest-admin@fixhub.com' });
  });

  it('should register a new user', async () => {
    const res = await request(app)
      .post('/api/user/register')
      .send({
        fullName: 'Test User',
        email: testEmail,
        password: 'testpass123',
        phone: '1234567890',
      });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    userId = res.body.data.id || res.body.data._id;
  });

  it('should login user', async () => {
    const res = await request(app)
      .post('/api/user/login')
      .send({
        email: testEmail,
        password: 'testpass123',
      });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
  });

  it('should get user profile', async () => {
    // Login to get token
    const loginRes = await request(app)
      .post('/api/user/login')
      .send({
        email: testEmail,
        password: 'testpass123',
      });
    const token = loginRes.body.token;

    const res = await request(app)
      .get('/api/user/profile')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.email).toBe(testEmail);
  });

  it('should update user profile', async () => {
    // Login to get token
    const loginRes = await request(app)
      .post('/api/user/login')
      .send({
        email: testEmail,
        password: 'testpass123',
      });
    const token = loginRes.body.token;

    const res = await request(app)
      .put('/api/user/profile')
      .set('Authorization', `Bearer ${token}`)
      .field('phone', '9800000000');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.phone).toBe('9800000000');
  });

  it('should get all users with pagination', async () => {
    const res = await request(app)
      .get('/api/admin/users?page=1&limit=5')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.totalPages).toBeDefined();
    expect(res.body.currentPage).toBeDefined();
  });

  it('should send reset password link', async () => {
    const res = await request(app)
      .post('/api/user/forgot-password')
      .send({ email: testEmail });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should fail to reset password with invalid token', async () => {
    const res = await request(app)
      .post('/api/user/reset-password/invalidtoken')
      .send({ password: 'newpass123' });
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  // Add more tests for update, delete, etc.
});
