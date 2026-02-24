const request = require('supertest');
const jwt = require('jsonwebtoken');
const prisma = require('../src/lib/prisma');
const { app } = require('../src/server');

const suffix = Date.now();
const adminEmail = `admin-invite-${suffix}@example.com`;
const publisherEmail = `publisher-invite-${suffix}@example.com`;
const invitedEmail = `invited-${suffix}@example.com`;

const signToken = (userId) => jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '1h' });

describe('Admin Invite API', () => {
  let adminUser;
  let publisherUser;

  beforeAll(async () => {
    await prisma.user.deleteMany({
      where: {
        email: { in: [adminEmail, publisherEmail, invitedEmail] },
      },
    });

    adminUser = await prisma.user.create({
      data: {
        email: adminEmail,
        password: 'password123',
        name: 'Admin Invite',
        role: 'ADMIN',
        isVerified: true,
      },
    });

    publisherUser = await prisma.user.create({
      data: {
        email: publisherEmail,
        password: 'password123',
        name: 'Publisher Invite',
        role: 'PUBLISHER',
        isVerified: true,
      },
    });
  });

  afterAll(async () => {
    await prisma.user.deleteMany({
      where: {
        email: { in: [adminEmail, publisherEmail, invitedEmail] },
      },
    });
  });

  it('debe rechazar invitación sin token', async () => {
    await request(app)
      .post('/api/admin/users/invite')
      .send({ email: invitedEmail, name: 'Invitado sin token' })
      .expect(401);
  });

  it('debe rechazar invitación para usuario no-admin', async () => {
    const publisherToken = signToken(publisherUser.id);

    await request(app)
      .post('/api/admin/users/invite')
      .set('Authorization', `Bearer ${publisherToken}`)
      .send({ email: invitedEmail, name: 'Invitado no admin' })
      .expect(403);
  });

  it('debe validar email requerido', async () => {
    const adminToken = signToken(adminUser.id);

    const response = await request(app)
      .post('/api/admin/users/invite')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Sin email' })
      .expect(400);

    expect(response.body).toHaveProperty('success', false);
    expect(response.body).toHaveProperty('error');
  });

  it('debe crear invitación y devolver estado de entrega de email', async () => {
    const adminToken = signToken(adminUser.id);

    const response = await request(app)
      .post('/api/admin/users/invite')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ email: invitedEmail, name: 'Invitado Admin' })
      .expect(201);

    expect(response.body).toHaveProperty('success', true);
    expect(response.body.data).toHaveProperty('registrationLink');
    expect(response.body.data).toHaveProperty('emailDelivery');
    expect(['sent', 'skipped']).toContain(response.body.data.emailDelivery.status);
  });

  it('debe fallar si email ya existe', async () => {
    const adminToken = signToken(adminUser.id);

    await request(app)
      .post('/api/admin/users/invite')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ email: invitedEmail, name: 'Duplicado' })
      .expect(400);
  });
});
