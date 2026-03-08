import request from 'supertest';
import app from '../../test-app';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import User from '../../models/User';
import Service from '../../models/Service';
import path from 'path';
import fs from 'fs';

describe('Service API', () => {
  let adminToken: string;
  let serviceId: string;
  let testImagePath: string;

  beforeAll(async () => {
    // Create admin user directly in DB for test isolation
    const hashedPassword = await bcrypt.hash('admin123', 10);
    let adminUser = await User.findOne({ email: 'servicetest-admin@fixhub.com' });
    if (!adminUser) {
      adminUser = await User.create({
        fullName: 'Service Test Admin',
        email: 'servicetest-admin@fixhub.com',
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

    // Create a small test image file
    const uploadsDir = path.join(__dirname, '..', '..', '..', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    testImagePath = path.join(uploadsDir, 'test-service-image.png');
    // Create a minimal valid PNG file (1x1 pixel)
    const pngBuffer = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      'base64'
    );
    fs.writeFileSync(testImagePath, pngBuffer);
  });

  afterAll(async () => {
    await User.deleteOne({ email: 'servicetest-admin@fixhub.com' });
    // Clean up created test service if it exists
    if (serviceId) {
      const service = await Service.findById(serviceId);
      if (service && service.image && fs.existsSync(service.image)) {
        fs.unlinkSync(service.image);
      }
      await Service.findByIdAndDelete(serviceId);
    }
    // Clean up test image
    if (fs.existsSync(testImagePath)) {
      fs.unlinkSync(testImagePath);
    }
  });

  it('should get all services with pagination', async () => {
    const res = await request(app)
      .get('/api/admin/services?page=1&limit=5')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('should create a new service', async () => {
    const res = await request(app)
      .post('/api/admin/services')
      .set('Authorization', `Bearer ${adminToken}`)
      .attach('image', testImagePath)
      .field('name', 'Test Service')
      .field('description', 'Test service description')
      .field('price', '100')
      .field('duration', '1 hour');
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    serviceId = res.body.data._id;
  });

  it('should update a service', async () => {
    const res = await request(app)
      .put(`/api/admin/services/${serviceId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .field('name', 'Updated Service');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should get single service by id', async () => {
    // serviceId is set in the create test
    const res = await request(app)
      .get(`/api/admin/services/${serviceId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data._id).toBe(serviceId);
  });

  it('should delete a service', async () => {
    const res = await request(app)
      .delete(`/api/admin/services/${serviceId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    // Mark as deleted so afterAll doesn't try to clean it up again
    serviceId = '';
  });
});
