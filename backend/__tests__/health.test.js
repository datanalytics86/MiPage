const request = require('supertest');
const { app } = require('../src/server');

describe('Health and Readiness API', () => {
  it('debe responder health check en /health', async () => {
    const response = await request(app).get('/health').expect(200);

    expect(response.body).toHaveProperty('status', 'ok');
    expect(response.body).toHaveProperty('environment');
  });

  it('debe responder health check en /api/health', async () => {
    const response = await request(app).get('/api/health').expect(200);

    expect(response.body).toHaveProperty('status', 'ok');
    expect(response.body).toHaveProperty('version', '1.0.0');
  });

  it('debe responder readiness en /readyz', async () => {
    const response = await request(app).get('/readyz').expect(200);

    expect(response.body).toHaveProperty('status', 'ready');
    expect(response.body).toHaveProperty('checks');
    expect(response.body.checks).toEqual(
      expect.objectContaining({
        jwtSecret: true,
        database: true,
      })
    );
  });

  it('debe responder readiness en /api/readyz con versión', async () => {
    const response = await request(app).get('/api/readyz').expect(200);

    expect(response.body).toHaveProperty('status', 'ready');
    expect(response.body).toHaveProperty('version', '1.0.0');
    expect(response.body).toHaveProperty('checks');
  });
});
