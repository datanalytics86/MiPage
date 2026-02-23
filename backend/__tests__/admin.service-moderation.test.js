const request = require('supertest');
const jwt = require('jsonwebtoken');
const prisma = require('../src/lib/prisma');
const { app } = require('../src/server');

const suffix = Date.now();
const adminEmail = `admin-moderation-${suffix}@example.com`;
const userEmail = `user-moderation-${suffix}@example.com`;
const publisherEmail = `publisher-moderation-${suffix}@example.com`;

const createToken = (userId) => jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '1h' });

describe('Admin Service Moderation API', () => {
  let adminUser;
  let normalUser;
  let publisherUser;
  let pendingService;

  beforeAll(async () => {
    await prisma.notification.deleteMany({
      where: {
        user: {
          email: { in: [adminEmail, userEmail, publisherEmail] },
        },
      },
    });

    await prisma.service.deleteMany({
      where: {
        user: {
          email: { in: [adminEmail, userEmail, publisherEmail] },
        },
      },
    });

    await prisma.user.deleteMany({
      where: {
        email: { in: [adminEmail, userEmail, publisherEmail] },
      },
    });

    adminUser = await prisma.user.create({
      data: {
        email: adminEmail,
        password: 'password123',
        name: 'Admin Moderation',
        role: 'ADMIN',
        isVerified: true,
      },
    });

    normalUser = await prisma.user.create({
      data: {
        email: userEmail,
        password: 'password123',
        name: 'User Moderation',
        role: 'USER',
        isVerified: true,
      },
    });

    publisherUser = await prisma.user.create({
      data: {
        email: publisherEmail,
        password: 'password123',
        name: 'Publisher Moderation',
        role: 'PUBLISHER',
        isVerified: true,
      },
    });

    pendingService = await prisma.service.create({
      data: {
        userId: publisherUser.id,
        category: 'MODELAJE',
        title: 'Servicio pendiente revisión',
        description: 'Servicio para test de moderación admin',
        price: 85000,
        location: 'Centro',
        city: 'Santiago',
        photos: ['https://example.com/photo.jpg'],
        status: 'PENDING',
      },
    });
  });

  afterAll(async () => {
    await prisma.notification.deleteMany({
      where: {
        user: {
          email: { in: [adminEmail, userEmail, publisherEmail] },
        },
      },
    });

    await prisma.service.deleteMany({
      where: {
        user: {
          email: { in: [adminEmail, userEmail, publisherEmail] },
        },
      },
    });

    await prisma.user.deleteMany({
      where: {
        email: { in: [adminEmail, userEmail, publisherEmail] },
      },
    });
  });

  it('debe bloquear aprobar servicio sin token', async () => {
    await request(app)
      .put(`/api/admin/services/${pendingService.id}/approve`)
      .expect(401);
  });

  it('debe bloquear aprobar servicio para no-admin', async () => {
    const userToken = createToken(normalUser.id);

    await request(app)
      .put(`/api/admin/services/${pendingService.id}/approve`)
      .set('Authorization', `Bearer ${userToken}`)
      .expect(403);
  });

  it('debe aprobar servicio y notificar al publisher', async () => {
    const adminToken = createToken(adminUser.id);

    const response = await request(app)
      .put(`/api/admin/services/${pendingService.id}/approve`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(response.body).toHaveProperty('service');
    expect(response.body.service.status).toBe('APPROVED');

    const serviceInDb = await prisma.service.findUnique({ where: { id: pendingService.id } });
    expect(serviceInDb.status).toBe('APPROVED');

    const notifications = await prisma.notification.findMany({
      where: {
        userId: publisherUser.id,
        type: 'service_approved',
      },
    });

    expect(notifications.length).toBeGreaterThan(0);
  });

  it('debe rechazar servicio y crear notificación de rechazo', async () => {
    const adminToken = createToken(adminUser.id);

    const secondService = await prisma.service.create({
      data: {
        userId: publisherUser.id,
        category: 'MASAJES_PROFESIONALES',
        title: 'Servicio pendiente rechazo',
        description: 'Servicio para test de rechazo admin',
        price: 65000,
        location: 'Providencia',
        city: 'Santiago',
        photos: ['https://example.com/photo-2.jpg'],
        status: 'PENDING',
      },
    });

    const reason = 'No cumple lineamientos de calidad';

    const response = await request(app)
      .put(`/api/admin/services/${secondService.id}/reject`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ reason })
      .expect(200);

    expect(response.body).toHaveProperty('service');
    expect(response.body.service.status).toBe('REJECTED');

    const serviceInDb = await prisma.service.findUnique({ where: { id: secondService.id } });
    expect(serviceInDb.status).toBe('REJECTED');

    const rejectionNotification = await prisma.notification.findFirst({
      where: {
        userId: publisherUser.id,
        type: 'service_rejected',
        message: reason,
      },
    });

    expect(rejectionNotification).toBeTruthy();
  });
});
