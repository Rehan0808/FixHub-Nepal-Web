import request from 'supertest';
import app from '../../test-app';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import User from '../../models/User';

describe('Admin API', () => {
  let adminToken: string;
  let adminUserId: string;

  beforeAll(async () => {
    // Create admin user directly in DB for test isolation
    const hashedPassword = await bcrypt.hash('admin123', 10);
    let adminUser = await User.findOne({ email: 'testadmin@fixhub.com' });
    if (!adminUser) {
      adminUser = await User.create({
        fullName: 'Test Admin',
        email: 'testadmin@fixhub.com',
        password: hashedPassword,
        role: 'admin',
        phone: '9876543210',
      });
    } else {
      adminUser.password = hashedPassword;
      adminUser.role = 'admin';
      await adminUser.save();
    }
    adminUserId = adminUser._id.toString();
    adminToken = jwt.sign(
      { _id: adminUser._id, email: adminUser.email, fullName: adminUser.fullName, role: 'admin' },
      process.env.SECRET as string,
      { expiresIn: '1d' }
    );
  });

  afterAll(async () => {
    // Clean up test data
    await User.deleteOne({ email: 'testadmin@fixhub.com' });
    await User.deleteOne({ email: 'admintest@example.com' });
  });

  it('should get dashboard data', async () => {
    const res = await request(app)
      .get('/api/admin/dashboard-summary')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should create a new user', async () => {
    const res = await request(app)
      .post('/api/admin/users/create')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        fullName: 'Admin Test',
        email: 'admintest@example.com',
        password: 'adminpass123',
        role: 'admin',
        phone: '9876543210',
      });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('should update a user', async () => {
    // Find user by email
    const usersRes = await request(app)
      .get('/api/admin/users?page=1&limit=10')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(usersRes.body.data).toBeDefined();
    const user = usersRes.body.data.find((u: any) => u.email === 'admintest@example.com');
    expect(user).toBeDefined();
    const res = await request(app)
      .put(`/api/admin/users/${user._id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ fullName: 'Admin Test Updated' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should get single user by id', async () => {
    // Find user by email
    const usersRes = await request(app)
      .get('/api/admin/users?page=1&limit=10')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(usersRes.body.data).toBeDefined();
    const user = usersRes.body.data.find((u: any) => u.email === 'admintest@example.com');
    expect(user).toBeDefined();
    const res = await request(app)
      .get(`/api/admin/users/${user._id}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data._id).toBe(user._id);
  });

  it('should delete a user', async () => {
    // Find user by email
    const usersRes = await request(app)
      .get('/api/admin/users?page=1&limit=10')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(usersRes.body.data).toBeDefined();
    const user = usersRes.body.data.find((u: any) => u.email === 'admintest@example.com');
    expect(user).toBeDefined();
    const res = await request(app)
      .delete(`/api/admin/users/${user._id}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  // Add more tests for services, bookings, etc.
});
