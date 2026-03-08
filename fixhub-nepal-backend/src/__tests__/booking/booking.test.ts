import request from 'supertest';
import app from '../../test-app';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import User from '../../models/User';
import Service from '../../models/Service';
import Booking from '../../models/Booking';

// The test app has no Socket.IO server, so mock notify to prevent
// "Cannot read properties of undefined (reading 'to')" crashes.
jest.mock('../../utils/notify', () => ({
  createAndEmitNotification: jest.fn().mockResolvedValue({}),
}));

describe('Booking API', () => {
  let adminToken: string;
  let userToken: string;
  let userId: string;
  let serviceId: string;
  let bookingId: string;

  beforeAll(async () => {
    // 1. Create Admin
    const hashedPassword = await bcrypt.hash('admin123', 10);
    let adminUser = await User.findOne({ email: 'bookingtest-admin@fixhub.com' });
    if (!adminUser) {
      adminUser = await User.create({
        fullName: 'Booking Test Admin',
        email: 'bookingtest-admin@fixhub.com',
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

    // 2. Create Normal User
    let normalUser = await User.findOne({ email: 'bookingtest-user@fixhub.com' });
    if (!normalUser) {
      normalUser = await User.create({
        fullName: 'Booking Test User',
        email: 'bookingtest-user@fixhub.com',
        password: hashedPassword,
        role: 'normal',
        phone: '9800000000',
      });
    }
    userId = normalUser._id.toString();
    userToken = jwt.sign(
      { _id: normalUser._id, email: normalUser.email, fullName: normalUser.fullName, role: 'normal' },
      process.env.SECRET as string,
      { expiresIn: '1d' }
    );

    // 3. Create a Test Service
    const service = await Service.create({
      name: 'Booking Test Service',
      description: 'Test Service Description',
      price: 500,
      duration: '1 hour',
      image: 'uploads/test.png',
      isAvailable: true,
    });
    serviceId = service._id.toString();
  });

  afterAll(async () => {
    await User.deleteOne({ email: 'bookingtest-admin@fixhub.com' });
    await User.deleteOne({ email: 'bookingtest-user@fixhub.com' });
    await Service.deleteOne({ _id: serviceId });
    await Booking.deleteMany({ user: userId });
  });

  it('should create a booking', async () => {
    const res = await request(app)
      .post('/api/user/bookings')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        serviceId: serviceId,
        date: new Date().toISOString(),
        bikeModel: 'Test Bike Model', // Required field
        notes: 'Test notes',
        requestedPickupDropoff: false
      });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    bookingId = res.body.data._id;
  });

  it('should get user bookings', async () => {
    const res = await request(app)
      .get('/api/user/bookings')
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.some((b: any) => b._id === bookingId)).toBe(true);
  });

  it('should get single booking by id', async () => {
    const res = await request(app)
      .get(`/api/user/bookings/${bookingId}`)
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data._id).toBe(bookingId);
  });

  it('should get all bookings (admin) with pagination', async () => {
    const res = await request(app)
      .get('/api/admin/bookings?page=1&limit=5')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('should cancel/delete booking', async () => {
    const res = await request(app)
      .delete(`/api/user/bookings/${bookingId}`)
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
