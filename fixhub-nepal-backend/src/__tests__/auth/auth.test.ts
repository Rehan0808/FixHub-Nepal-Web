/**
 * Auth API Supertest Tests (Tests 1-10)
 * Covers: register, login, forgot-password, auth middleware guard
 */

import request from 'supertest';
import app from '../../test-app';
import User from '../../models/User';

describe('Auth API', () => {
  const testEmail = 'authtest-user@fixhub.test';
  const testPassword = 'TestPass123!';

  beforeAll(async () => {
    await User.deleteOne({ email: testEmail });
  });

  afterAll(async () => {
    await User.deleteOne({ email: testEmail });
  });

  // ─── Test 1 ──────────────────────────────────────────────────────────────
  it('POST /register - should register a new user successfully', async () => {
    const res = await request(app)
      .post('/api/user/register')
      .send({ fullName: 'Auth Test User', email: testEmail, password: testPassword });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.email).toBe(testEmail);
    expect(res.body.data.fullName).toBe('Auth Test User');
  });

  // ─── Test 2 ──────────────────────────────────────────────────────────────
  it('POST /register - should return 400 if required fields are missing', async () => {
    const res = await request(app)
      .post('/api/user/register')
      .send({ email: 'incomplete@fixhub.test' }); // missing fullName and password

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBeDefined();
  });

  // ─── Test 3 ──────────────────────────────────────────────────────────────
  it('POST /register - should return 409 if email already exists', async () => {
    const res = await request(app)
      .post('/api/user/register')
      .send({ fullName: 'Auth Test User', email: testEmail, password: testPassword });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/already exists/i);
  });

  // ─── Test 4 ──────────────────────────────────────────────────────────────
  it('POST /login - should login and return a JWT token', async () => {
    const res = await request(app)
      .post('/api/user/login')
      .send({ email: testEmail, password: testPassword });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(typeof res.body.token).toBe('string');
    expect(res.body.data.email).toBe(testEmail);
  });

  // ─── Test 5 ──────────────────────────────────────────────────────────────
  it('POST /login - should return 400 if email or password is missing', async () => {
    const res = await request(app)
      .post('/api/user/login')
      .send({ email: testEmail }); // missing password

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  // ─── Test 6 ──────────────────────────────────────────────────────────────
  it('POST /login - should return 401 for wrong password', async () => {
    const res = await request(app)
      .post('/api/user/login')
      .send({ email: testEmail, password: 'wrongpassword' });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/invalid credentials/i);
  });

  // ─── Test 7 ──────────────────────────────────────────────────────────────
  it('POST /login - should return 404 if user does not exist', async () => {
    const res = await request(app)
      .post('/api/user/login')
      .send({ email: 'nonexistent@fixhub.test', password: 'somepassword' });

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/not found/i);
  });

  // ─── Test 8 ──────────────────────────────────────────────────────────────
  it('POST /forgot-password - should return 200 and a success message', async () => {
    const res = await request(app)
      .post('/api/user/forgot-password')
      .send({ email: testEmail });

    // The endpoint always returns 200 (security best-practice: no user enumeration)
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  // ─── Test 9 ──────────────────────────────────────────────────────────────
  it('POST /forgot-password - should return 400 if email field is missing', async () => {
    const res = await request(app)
      .post('/api/user/forgot-password')
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  // ─── Test 10 ─────────────────────────────────────────────────────────────
  it('GET /profile - should return 401 when no Authorization header is provided', async () => {
    const res = await request(app).get('/api/user/profile');

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/no token provided/i);
  });
});
