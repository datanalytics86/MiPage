/**
 * Tests para autenticación
 */

const request = require('supertest');
const { app } = require('../src/server');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

describe('Auth API', () => {
  // Setup: Limpiar base de datos antes de tests
  beforeAll(async () => {
    await prisma.user.deleteMany({
      where: {
        email: {
          in: ['test@example.com', 'newuser@example.com'],
        },
      },
    });
  });

  // Cleanup: Limpiar después de tests
  afterAll(async () => {
    await prisma.user.deleteMany({
      where: {
        email: {
          in: ['test@example.com', 'newuser@example.com'],
        },
      },
    });
    await prisma.$disconnect();
  });

  describe('POST /api/auth/register', () => {
    it('debe registrar un nuevo usuario', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'password123',
          name: 'Test User',
        })
        .expect(201);

      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('token');
      expect(response.body.user.email).toBe('test@example.com');
      expect(response.body.user.name).toBe('Test User');
    });

    it('debe fallar si el email ya existe', async () => {
      await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
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
      const hashedPassword = await bcrypt.hash('testpass123', 10);
      await prisma.user.create({
        data: {
          email: 'logintest@example.com',
          password: hashedPassword,
          name: 'Login Test',
        },
      });
    });

    afterAll(async () => {
      await prisma.user.deleteMany({
        where: { email: 'logintest@example.com' },
      });
    });

    it('debe hacer login con credenciales correctas', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'logintest@example.com',
          password: 'testpass123',
        })
        .expect(200);

      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('token');
      expect(response.body.user.email).toBe('logintest@example.com');
    });

    it('debe fallar con contraseña incorrecta', async () => {
      await request(app)
        .post('/api/auth/login')
        .send({
          email: 'logintest@example.com',
          password: 'wrongpassword',
        })
        .expect(401);
    });

    it('debe fallar con email no existente', async () => {
      await request(app)
        .post('/api/auth/login')
        .send({
          email: 'noexiste@example.com',
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
          email: 'logintest@example.com',
          password: 'testpass123',
        });

      authToken = response.body.token;
    });

    it('debe obtener perfil con token válido', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('email');
      expect(response.body.email).toBe('logintest@example.com');
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
