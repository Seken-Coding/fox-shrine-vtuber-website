const request = require('supertest');
const authRouter = require('../../routes/auth');
const createTestApp = require('../helpers/createTestApp');
const { createMockPool } = require('../helpers/mockPool');

jest.mock('../../db', () => ({
  getPool: jest.fn(),
  sql: {
    NVarChar: jest.fn(),
    Int: jest.fn(),
    DateTime2: jest.fn(),
    MAX: Symbol('MAX'),
  },
}));

jest.mock('../../utils/auth', () => ({
  generateTokens: jest.fn(),
  hashPassword: jest.fn(),
  verifyPassword: jest.fn(),
}));

jest.mock('../../middleware/auth', () => ({
  authenticateToken: jest.fn((req, _res, next) => {
    req.user = { id: 99, username: 'stub-user', permissions: [] };
    next();
  }),
  fetchUserWithPermissions: jest.fn(),
}));

const { getPool } = require('../../db');
const { verifyPassword, generateTokens } = require('../../utils/auth');
const { fetchUserWithPermissions, authenticateToken } = require('../../middleware/auth');

describe('Auth routes', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('logs in an active user with valid credentials', async () => {
    const userRow = {
      Id: 1,
      Username: 'kitsune',
      Email: 'kitsune@example.com',
      PasswordHash: 'hashed-password',
      DisplayName: 'Kitsune',
      IsActive: 1,
      LoginAttempts: 0,
      LockedUntil: null,
    };

    verifyPassword.mockResolvedValue(true);
    generateTokens.mockReturnValue({ accessToken: 'access-token', refreshToken: 'refresh-token' });
    fetchUserWithPermissions.mockResolvedValue({
      id: 1,
      username: 'kitsune',
      email: 'kitsune@example.com',
      displayName: 'Kitsune',
      role: 'Admin',
      permissions: ['config.write'],
    });

    getPool.mockResolvedValue(
      createMockPool({
        query: (sql) => {
          if (sql.includes('SELECT Id, Username')) {
            return { recordset: [userRow] };
          }
          return { recordset: [] };
        },
        execute: () => ({ recordset: [] }),
      })
    );

    const app = createTestApp(authRouter, { basePath: '/api/auth' });
    const response = await request(app)
      .post('/api/auth/login')
      .send({ username: 'kitsune', password: 'top-secret' });

    expect(getPool).toHaveBeenCalled();
    expect(verifyPassword).toHaveBeenCalledWith('top-secret', 'hashed-password');
    expect(fetchUserWithPermissions).toHaveBeenCalledWith(1);
    expect(generateTokens).toHaveBeenCalledWith(1);
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      success: true,
      user: {
        id: 1,
        username: 'kitsune',
        role: 'Admin',
      },
      tokens: {
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      },
    });
  });

  it('returns the authenticated user profile', async () => {
    authenticateToken.mockImplementationOnce((req, _res, next) => {
      req.user = { id: 7, username: 'mei', permissions: ['users.read'] };
      next();
    });

    const app = createTestApp(authRouter, { basePath: '/api/auth' });
    const response = await request(app).get('/api/auth/profile');

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      success: true,
      user: { id: 7, username: 'mei' },
    });
  });
});
