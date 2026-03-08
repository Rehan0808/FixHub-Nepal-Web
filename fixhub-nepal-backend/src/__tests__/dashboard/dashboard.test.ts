/**
 * Dashboard & Admin User Management Supertest Tests (Tests 19-25)
 * Covers: user dashboard, admin dashboard analytics, admin user listing & search
 */

import request from 'supertest';
import app from '../../test-app';
import User from '../../models/User';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

describe('Dashboard & Admin User Management API', () => {
  let userToken: string;
  let adminToken: string;

  beforeAll(async () => {
    const hashedPassword = await bcrypt.hash('dashtest123', 10);

    // Create normal user
    await User.deleteOne({ email: 'dashtest-user@fixhub.test' });
    const user = await User.create({
      fullName: 'Dashboard Test User',
      email: 'dashtest-user@fixhub.test',
      password: hashedPassword,
      role: 'normal',
      phone: '9800000010',
    });
    userToken = jwt.sign(
      { _id: user._id, email: user.email, fullName: user.fullName, role: user.role },
      process.env.SECRET as string,
      { expiresIn: '1d' }
    );

    // Create admin user
    await User.deleteOne({ email: 'dashtest-admin@fixhub.test' });
    const admin = await User.create({
      fullName: 'Dashboard Test Admin',
      email: 'dashtest-admin@fixhub.test',
      password: hashedPassword,
      role: 'admin',
      phone: '9800000011',
    });
    adminToken = jwt.sign(
      { _id: admin._id, email: admin.email, fullName: admin.fullName, role: admin.role },
      process.env.SECRET as string,
      { expiresIn: '1d' }
    );
  });

  afterAll(async () => {
    await User.deleteOne({ email: 'dashtest-user@fixhub.test' });
    await User.deleteOne({ email: 'dashtest-admin@fixhub.test' });
    await User.deleteOne({ email: 'dashtest-created@fixhub.test' });
  });

  // ─── Test 19 ─────────────────────────────────────────────────────────────
  it('GET /api/user/dashboard-summary - should return 401 without auth', async () => {
    const res = await request(app).get('/api/user/dashboard-summary');

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  // ─── Test 20 ─────────────────────────────────────────────────────────────
  it('GET /api/user/dashboard-summary - should return dashboard summary data', async () => {
    const res = await request(app)
      .get('/api/user/dashboard-summary')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('upcomingBookings');
    expect(res.body.data).toHaveProperty('completedServices');
    expect(res.body.data).toHaveProperty('loyaltyPoints');
    expect(res.body.data).toHaveProperty('recentBookings');
  });

  // ─── Test 21 ─────────────────────────────────────────────────────────────
  it('GET /api/admin/dashboard-summary - should return 401 without auth', async () => {
    const res = await request(app).get('/api/admin/dashboard-summary');

    expect(res.status).toBe(401);
  });

  // ─── Test 22 ─────────────────────────────────────────────────────────────
  it('GET /api/admin/dashboard-summary - should return 403 for non-admin role', async () => {
    const res = await request(app)
      .get('/api/admin/dashboard-summary')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  // ─── Test 23 ─────────────────────────────────────────────────────────────
  it('GET /api/admin/dashboard-summary - should return analytics data for admin', async () => {
    const res = await request(app)
      .get('/api/admin/dashboard-summary')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('totalRevenue');
    expect(res.body.data).toHaveProperty('totalBookings');
    expect(res.body.data).toHaveProperty('totalUsers');
    expect(res.body.data).toHaveProperty('totalServices');
    expect(res.body.data).toHaveProperty('recentBookings');
  });

  // ─── Test 24 ─────────────────────────────────────────────────────────────
  it('GET /api/admin/users - should return paginated user list for admin', async () => {
    const res = await request(app)
      .get('/api/admin/users?page=1&limit=10')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body).toHaveProperty('totalPages');
    expect(res.body).toHaveProperty('currentPage');
  });

  // ─── Test 25 ─────────────────────────────────────────────────────────────
  it('GET /api/admin/users - should filter users by search query', async () => {
    const res = await request(app)
      .get('/api/admin/users?search=Dashboard+Test')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    // At least one result should match either of the test users we created
    const emails: string[] = res.body.data.map((u: any) => u.email as string);
    expect(emails.some((e) => e.includes('dashtest'))).toBe(true);
  });
});
