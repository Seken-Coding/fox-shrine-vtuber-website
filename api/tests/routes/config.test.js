jest.mock('../../db', () => ({
  getPool: jest.fn(),
  sql: {
    NVarChar: jest.fn(),
    Int: jest.fn(),
    DateTime2: jest.fn(),
    MAX: Symbol('MAX'),
  },
}));

jest.mock('../../middleware/auth', () => {
  const actual = jest.requireActual('../../middleware/auth');

  const optionalAuth = jest.fn((req, _res, next) => {
    req.user = null;
    next();
  });

  const authenticateToken = jest.fn((req, _res, next) => {
    req.user = {
      id: 42,
      username: 'admin',
      permissions: ['config.write', 'config.delete'],
    };
    next();
  });

  return {
    ...actual,
    optionalAuth,
    authenticateToken,
  };
});

jest.mock('../../utils/audit', () => ({
  logAuditTrail: jest.fn().mockResolvedValue(undefined),
}));

const request = require('supertest');
const configRouter = require('../../routes/config');
const createTestApp = require('../helpers/createTestApp');
const { createMockPool } = require('../helpers/mockPool');

const { getPool } = require('../../db');
const { authenticateToken, requirePermission } = require('../../middleware/auth');
const { logAuditTrail } = require('../../utils/audit');

describe('Config routes', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('returns parsed configuration data for guests', async () => {
    getPool.mockResolvedValue(
      createMockPool({
        execute: (proc) => {
          if (proc === 'GetActiveConfiguration') {
            return {
              recordset: [
                { Key: 'characterName', Value: 'Mei', Category: 'character' },
                { Key: 'stream.isLive', Value: 'true', Category: 'stream' },
                {
                  Key: 'content.schedule',
                  Value: '[{"day":"Saturday","time":"7PM"}]',
                  Category: 'content',
                },
              ],
            };
          }
          if (proc === 'LogUserActivity') {
            return { recordset: [] };
          }
          throw new Error(`Unexpected procedure ${proc}`);
        },
      })
    );

    const app = createTestApp(configRouter, { basePath: '/api/config' });
    const response = await request(app).get('/api/config');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toMatchObject({
      character: { name: 'Mei' },
      stream: { isLive: true },
      content: { schedule: [{ day: 'Saturday', time: '7PM' }] },
    });
  });

  it('returns configuration data for a category', async () => {
    getPool.mockResolvedValue(
      createMockPool({
        execute: (proc, inputs) => {
          if (proc === 'GetConfigurationByCategory') {
            expect(inputs.Category).toBe('content');
            return {
              recordset: [
                {
                  Key: 'heroTitle',
                  Value: 'Welcome to the Shrine',
                  Category: 'content',
                },
              ],
            };
          }
          throw new Error(`Unexpected procedure ${proc}`);
        },
      })
    );

    const app = createTestApp(configRouter, { basePath: '/api/config' });
    const response = await request(app).get('/api/config/content');

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      success: true,
      category: 'content',
      data: {
        content: {
          heroTitle: 'Welcome to the Shrine',
        },
      },
    });
  });

  it('updates configuration values when user has permission', async () => {
    getPool.mockResolvedValue(
      createMockPool({
        execute: (proc) => {
          if (proc === 'UpsertConfiguration') {
            return {
              recordset: [
                {
                  Key: 'heroTitle',
                  Value: 'Welcome to the Shrine',
                  Category: 'content',
                },
              ],
            };
          }
          if (proc === 'LogUserActivity') {
            return { recordset: [] };
          }
          throw new Error(`Unexpected procedure ${proc}`);
        },
      })
    );

    const app = createTestApp(configRouter, { basePath: '/api/config' });
    const response = await request(app)
      .put('/api/config/heroTitle')
      .send({ value: 'Welcome to the Shrine', category: 'content' });

    expect(authenticateToken).toHaveBeenCalled();
    expect(requirePermission).toBeInstanceOf(Function);
    expect(logAuditTrail).toHaveBeenCalledWith(
      expect.any(Object),
      'UPDATE_CONFIG',
      expect.stringContaining('heroTitle')
    );
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      success: true,
      data: {
        Key: 'heroTitle',
        Value: 'Welcome to the Shrine',
        Category: 'content',
      },
    });
  });

  it('rejects configuration updates when user lacks permission', async () => {
    authenticateToken.mockImplementationOnce((req, _res, next) => {
      req.user = { id: 7, username: 'viewer', permissions: ['config.read'] };
      next();
    });

    const app = createTestApp(configRouter, { basePath: '/api/config' });
    const response = await request(app)
      .put('/api/config/heroTitle')
      .send({ value: 'You shall not pass', category: 'content' });

    expect(response.status).toBe(403);
    expect(response.body).toMatchObject({
      success: false,
      code: 'INSUFFICIENT_PERMISSIONS',
    });
    expect(getPool).not.toHaveBeenCalled();
    expect(logAuditTrail).not.toHaveBeenCalled();
  });

  it('bulk updates configuration values when payload is valid', async () => {
    const execute = jest.fn((proc, inputs) => {
      if (proc === 'UpsertConfiguration') {
        return {
          recordset: [
            {
              Key: inputs.Key,
              Value: inputs.Value,
              Category: inputs.Category,
            },
          ],
        };
      }
      if (proc === 'LogUserActivity') {
        return { recordset: [] };
      }
      throw new Error(`Unexpected procedure ${proc}`);
    });

    getPool.mockResolvedValue(
      createMockPool({
        execute,
      })
    );

    const app = createTestApp(configRouter, { basePath: '/api/config' });
    const response = await request(app)
      .put('/api/config')
      .send({
        configs: [
          {
            key: 'content.heroTitle',
            value: 'Shrine Welcome',
            category: 'content',
          },
          {
            key: 'stream.isLive',
            value: false,
            category: 'stream',
          },
        ],
      });

    expect(execute).toHaveBeenCalled();
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      success: true,
      count: 2,
      data: [
        {
          Key: 'content.heroTitle',
          Value: 'Shrine Welcome',
          Category: 'content',
        },
        {
          Key: 'stream.isLive',
          Value: 'false',
          Category: 'stream',
        },
      ],
    });
  });

  it('rejects bulk updates when payload fails validation', async () => {
    const app = createTestApp(configRouter, { basePath: '/api/config' });
    const response = await request(app)
      .put('/api/config')
      .send({ configs: [{ value: 'Missing key' }] });

    expect(response.status).toBe(400);
    expect(getPool).not.toHaveBeenCalled();
  });

  it('deletes configuration value when user has permission', async () => {
    const query = jest.fn((sql, inputs) => {
      if (sql.includes('UPDATE Configuration')) {
        return {
          recordset: [
            {
              Key: inputs.Key,
              Value: 'old value',
              Category: 'content',
            },
          ],
        };
      }
      throw new Error(`Unexpected query ${sql}`);
    });

    getPool.mockResolvedValue(
      createMockPool({
        query,
        execute: (proc) => {
          if (proc === 'LogUserActivity') {
            return { recordset: [] };
          }
          throw new Error(`Unexpected procedure ${proc}`);
        },
      })
    );

    const app = createTestApp(configRouter, { basePath: '/api/config' });
    const response = await request(app).delete('/api/config/heroTitle');

    expect(query).toHaveBeenCalled();
    expect(logAuditTrail).toHaveBeenCalledWith(
      expect.any(Object),
      'DELETE_CONFIG',
      expect.stringContaining('heroTitle')
    );
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      success: true,
      data: {
        Key: 'heroTitle',
        Category: 'content',
      },
    });
  });

  it('returns 404 when configuration key is missing during delete', async () => {
    const query = jest.fn((sql) => {
      if (sql.includes('UPDATE Configuration')) {
        return { recordset: [] };
      }
      throw new Error(`Unexpected query ${sql}`);
    });

    getPool.mockResolvedValue(
      createMockPool({
        query,
      })
    );

    const app = createTestApp(configRouter, { basePath: '/api/config' });
    const response = await request(app).delete('/api/config/missing');

    expect(response.status).toBe(404);
    expect(response.body).toMatchObject({
      success: false,
      error: 'Configuration not found',
    });
    expect(logAuditTrail).not.toHaveBeenCalled();
  });
});


