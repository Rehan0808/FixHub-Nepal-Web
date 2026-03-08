/**
 * Profile API Supertest Tests (Tests 11-18)
 * Covers: user profile GET/PUT, admin profile GET/PUT, change password
 */

import request from 'supertest';
import app from '../../test-app';
import User from '../../models/User';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

describe('Profile API', () => {
  let userToken: string;
  let adminToken: string;
  const userEmail = 'profiletest-user@fixhub.test';
  const adminEmail = 'profiletest-admin@fixhub.test';
  const rawPassword = 'profilepass123';

  beforeAll(async () => {
    const hashedPassword = await bcrypt.hash(rawPassword, 10);

    // Normal user
    await User.deleteOne({ email: userEmail });
    const user = await User.create({
      fullName: 'Profile Test User',
      email: userEmail,
      password: hashedPassword,
      role: 'normal',
      phone: '9800000001',
    });
    userToken = jwt.sign(
      { _id: user._id, email: user.email, fullName: user.fullName, role: user.role },
      process.env.SECRET as string,
      { expiresIn: '1d' }
    );

    // Admin user
    await User.deleteOne({ email: adminEmail });
    const admin = await User.create({
      fullName: 'Profile Test Admin',
      email: adminEmail,
      password: hashedPassword,
      role: 'admin',
      phone: '9800000002',
    });
    adminToken = jwt.sign(
      { _id: admin._id, email: admin.email, fullName: admin.fullName, role: admin.role },
      process.env.SECRET as string,
      { expiresIn: '1d' }
    );
  });

  afterAll(async () => {
    await User.deleteOne({ email: userEmail });
    await User.deleteOne({ email: adminEmail });
  });

  // ─── Test 11 ─────────────────────────────────────────────────────────────
  it('GET /api/user/profile - should return 401 without auth token', async () => {
    const res = await request(app).get('/api/user/profile');

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  // ─── Test 12 ─────────────────────────────────────────────────────────────
  it('GET /api/user/profile - should return user profile with valid token', async () => {
    const res = await request(app)
      .get('/api/user/profile')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.email).toBe(userEmail);
    expect(res.body.data.password).toBeUndefined(); // password must never be returned
  });

  // ─── Test 13 ─────────────────────────────────────────────────────────────
  it('PUT /api/user/profile - should update user profile fields', async () => {
    const res = await request(app)
      .put('/api/user/profile')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ fullName: 'Profile Updated Name', phone: '9800099999', address: 'Pokhara, Nepal' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.fullName).toBe('Profile Updated Name');
    expect(res.body.data.address).toBe('Pokhara, Nepal');
  });

  // ─── Test 14 ─────────────────────────────────────────────────────────────
  it('GET /api/admin/profile - should return 401 without auth token', async () => {
    const res = await request(app).get('/api/admin/profile');

    expect(res.status).toBe(401);
  });

  // ─── Test 15 ─────────────────────────────────────────────────────────────
  it('GET /api/admin/profile - should return 403 when accessed with normal user token', async () => {
    const res = await request(app)
      .get('/api/admin/profile')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/admin/i);
  });

  // ─── Test 16 ─────────────────────────────────────────────────────────────
  it('GET /api/admin/profile - should return admin profile with admin token', async () => {
    const res = await request(app)
      .get('/api/admin/profile')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.email).toBe(adminEmail);
    expect(res.body.data.password).toBeUndefined();
  });

  // ─── Test 17 ─────────────────────────────────────────────────────────────
  it('PUT /api/admin/profile - should update admin profile successfully', async () => {
    const res = await request(app)
      .put('/api/admin/profile')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ fullName: 'Admin Updated Name', phone: '9800000003' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.fullName).toBe('Admin Updated Name');
  });

  // ─── Test 18 ─────────────────────────────────────────────────────────────
  it('POST /api/user/change-password - should return 400 for wrong current password', async () => {
    const res = await request(app)
      .post('/api/user/change-password')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ currentPassword: 'definitelywrong', newPassword: 'newpass456' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});
