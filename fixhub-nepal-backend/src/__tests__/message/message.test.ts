import request from 'supertest';
import app from '../../test-app';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import User from '../../models/User';

describe('Message API', () => {
  let userToken: string;

  beforeAll(async () => {
    // Create user directly in DB for test isolation
    const hashedPassword = await bcrypt.hash('testpass123', 10);
    let user = await User.findOne({ email: 'msgtest-user@fixhub.com' });
    if (!user) {
      user = await User.create({
        fullName: 'Message Test User',
        email: 'msgtest-user@fixhub.com',
        password: hashedPassword,
        role: 'normal',
        phone: '9876543210',
      });
    } else {
      user.password = hashedPassword;
      await user.save();
    }
    userToken = jwt.sign(
      { _id: user._id, email: user.email, fullName: user.fullName, role: user.role },
      process.env.SECRET as string,
      { expiresIn: '1d' }
    );
  });

  afterAll(async () => {
    await User.deleteOne({ email: 'msgtest-user@fixhub.com' });
  });

  it('should get messages for user', async () => {
    const res = await request(app)
      .get('/api/messages')
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('should send a message', async () => {
    const res = await request(app)
      .post('/api/messages')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ message: 'Hello from test' });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.message).toBe('Hello from test');
  });

  // Add more tests for send, delete message
});
