const request = require('supertest');
const jwt = require('jsonwebtoken');
const prisma = require('../src/lib/prisma');
const { app } = require('../src/server');

const suffix = Date.now();
const adminEmail = `admin-access-${suffix}@example.com`;
const userEmail = `user-access-${suffix}@example.com`;

const createToken = (userId) =>
  jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '1h' });

describe('Admin Access Control API', () => {
  let adminUser;
  let normalUser;

  beforeAll(async () => {
    await prisma.user.deleteMany({
      where: {
        email: { in: [adminEmail, userEmail] },
      },
    });

    adminUser = await prisma.user.create({
      data: {
        email: adminEmail,
        password: 'password123',
        name: 'Admin Access',
        role: 'ADMIN',
        isVerified: true,
      },
    });

    normalUser = await prisma.user.create({
      data: {
        email: userEmail,
        password: 'password123',
        name: 'User Access',
        role: 'USER',
        isVerified: true,
      },
    });
  });

  afterAll(async () => {
    await prisma.user.deleteMany({
      where: {
        email: { in: [adminEmail, userEmail] },
      },
    });
  });

  it('debe bloquear /api/admin/stats sin token', async () => {
    await request(app).get('/api/admin/stats').expect(401);
  });

  it('debe bloquear /api/admin/stats para rol no-admin', async () => {
    const userToken = createToken(normalUser.id);

    await request(app)
      .get('/api/admin/stats')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(403);
  });

  it('debe permitir /api/admin/stats para admin', async () => {
    const adminToken = createToken(adminUser.id);

    const response = await request(app)
      .get('/api/admin/stats')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(response.body).toHaveProperty('users');
    expect(response.body).toHaveProperty('services');
    expect(response.body).toHaveProperty('reviews');
    expect(response.body).toHaveProperty('posts');
  });

  it('debe permitir /api/admin/users para admin', async () => {
    const adminToken = createToken(adminUser.id);

    const response = await request(app)
      .get('/api/admin/users?page=1&limit=5')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(response.body).toHaveProperty('users');
    expect(response.body).toHaveProperty('pagination');
    expect(Array.isArray(response.body.users)).toBe(true);
  });
});
