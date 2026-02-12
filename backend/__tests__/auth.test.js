/**
 * Tests para autenticación
 */

const request = require('supertest');
const prisma = require('../src/lib/prisma');
const { app, server, io } = require('../src/server');

const suffix = Date.now();
const registerEmail = `test-${suffix}@example.com`;
const loginEmail = `logintest-${suffix}@example.com`;
const loginPassword = 'testpass123';

describe('Auth API', () => {
  beforeAll(async () => {
    await prisma.user.deleteMany({
      where: {
        email: {
          in: [registerEmail, loginEmail],
        },
      },
    });
  });

  afterAll(async () => {
    io.close();
    await new Promise((resolve) => server.close(resolve));
    await prisma.$disconnect();
  });

  describe('POST /api/auth/register', () => {
    it('debe registrar un nuevo usuario', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: registerEmail,
          password: 'password123',
          name: 'Test User',
        })
        .expect(201);

      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('token');
      expect(response.body.user.email).toBe(registerEmail);
      expect(response.body.user.name).toBe('Test User');
    });

    it('debe fallar si el email ya existe', async () => {
      await request(app)
        .post('/api/auth/register')
        .send({
          email: registerEmail,
          password: 'password123',
          name: 'Test User',
        })
        .expect(409);
    });

    it('debe validar campos requeridos', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'invalid-email',
          password: 'short',
        })
        .expect(400);

      expect(response.body).toHaveProperty('errors');
    });
  });

  describe('POST /api/auth/login', () => {
    beforeAll(async () => {
      // Crear usuario para login tests
      await request(app)
        .post('/api/auth/register')
        .send({
          email: loginEmail,
          password: loginPassword,
          name: 'Login Test',
        })
        .expect(201);
    });

    it('debe hacer login con credenciales correctas', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: loginEmail,
          password: loginPassword,
        })
        .expect(200);

      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('token');
      expect(response.body.user.email).toBe(loginEmail);
    });

    it('debe fallar con contraseña incorrecta', async () => {
      await request(app)
        .post('/api/auth/login')
        .send({
          email: loginEmail,
          password: 'wrongpassword',
        })
        .expect(401);
    });

    it('debe fallar con email no existente', async () => {
      await request(app)
        .post('/api/auth/login')
        .send({
          email: `noexiste-${suffix}@example.com`,
          password: 'password123',
        })
        .expect(401);
    });
  });

  describe('GET /api/auth/profile', () => {
    let authToken;

    beforeAll(async () => {
      // Login para obtener token
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: loginEmail,
          password: loginPassword,
        });

      authToken = response.body.token;
    });

    it('debe obtener perfil con token válido', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('email');
      expect(response.body.email).toBe(loginEmail);
    });

    it('debe fallar sin token', async () => {
      await request(app).get('/api/auth/profile').expect(401);
    });

    it('debe fallar con token inválido', async () => {
      await request(app)
        .get('/api/auth/profile')
        .set('Authorization', 'Bearer invalid-token')
        .expect(403);
    });
  });
});
