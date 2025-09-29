const request = require('supertest');
const healthRouter = require('../../routes/health');
const createTestApp = require('../helpers/createTestApp');
const { createMockPool } = require('../helpers/mockPool');

jest.mock('../../db', () => ({
  getPool: jest.fn(),
}));

const { getPool } = require('../../db');

describe('Health routes', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('returns healthy status when the database responds', async () => {
    getPool.mockResolvedValue(
      createMockPool({
        query: () => ({ recordset: [{ status: 1 }] }),
      })
    );

    const app = createTestApp(healthRouter, { basePath: '/api' });
    const response = await request(app).get('/api/health');

    expect(getPool).toHaveBeenCalled();
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      status: 'healthy',
      database: 'connected',
    });
  });

  it('returns unhealthy status when the database is unreachable', async () => {
    getPool.mockRejectedValue(new Error('Connection failed'));

    const app = createTestApp(healthRouter, { basePath: '/api' });
    const response = await request(app).get('/api/health');

    expect(getPool).toHaveBeenCalled();
    expect(response.status).toBe(503);
    expect(response.body).toMatchObject({ status: 'unhealthy' });
  });
});
