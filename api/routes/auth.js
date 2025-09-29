const express = require('express');
const jwt = require('jsonwebtoken');
const { getPool, sql } = require('../db');
const {
  validate,
  userRegistrationSchema,
  userLoginSchema,
} = require('../middleware/validation');
const { authenticateToken, fetchUserWithPermissions } = require('../middleware/auth');
const { generateTokens, hashPassword, verifyPassword } = require('../utils/auth');
const { JWT_SECRET } = require('../config');

const router = express.Router();

router.post('/register', validate(userRegistrationSchema), async (req, res) => {
  try {
    const { username, email, password, displayName } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Username, email, and password are required',
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 8 characters long',
      });
    }

    const passwordHash = await hashPassword(password);
    const pool = await getPool();

    const result = await pool
      .request()
      .input('Username', sql.NVarChar(50), username)
      .input('Email', sql.NVarChar(255), email)
      .input('PasswordHash', sql.NVarChar(255), passwordHash)
      .input('DisplayName', sql.NVarChar(100), displayName || username)
      .input('RoleName', sql.NVarChar(50), 'Member')
      .input('CreatedBy', sql.NVarChar(100), 'self-registration')
      .execute('CreateUser');

    const user = result.recordset[0];
    const tokens = generateTokens(user.Id);

    await pool
      .request()
      .input('UserId', sql.Int, user.Id)
      .input('SessionToken', sql.NVarChar(500), tokens.accessToken)
      .input('RefreshToken', sql.NVarChar(500), tokens.refreshToken)
      .input('IPAddress', sql.NVarChar(45), req.ip)
      .input('UserAgent', sql.NVarChar(500), req.get('User-Agent') || '')
      .input('ExpiresAt', sql.DateTime2, new Date(Date.now() + 24 * 60 * 60 * 1000))
      .query(`
        INSERT INTO UserSessions (UserId, SessionToken, RefreshToken, IPAddress, UserAgent, ExpiresAt)
        VALUES (@UserId, @SessionToken, @RefreshToken, @IPAddress, @UserAgent, @ExpiresAt)
      `);

    await pool
      .request()
      .input('UserId', sql.Int, user.Id)
      .input('Action', sql.NVarChar(100), 'USER_REGISTERED')
      .input('IPAddress', sql.NVarChar(45), req.ip)
      .input('UserAgent', sql.NVarChar(500), req.get('User-Agent') || '')
      .execute('LogUserActivity');

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: {
        id: user.Id,
        username: user.Username,
        email: user.Email,
        displayName: user.DisplayName,
        role: user.RoleName,
      },
      tokens,
    });
  } catch (error) {
    console.error('Registration error:', error);

    if (error.number === 2627) {
      return res.status(409).json({
        success: false,
        error: 'Username or email already exists',
      });
    }

    res.status(500).json({
      success: false,
      error: 'Registration failed',
    });
  }
});

router.post('/login', validate(userLoginSchema), async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: 'Username and password are required',
      });
    }

    const pool = await getPool();

    const userResult = await pool
      .request()
      .input('Username', sql.NVarChar(50), username)
      .input('Email', sql.NVarChar(255), username)
      .query(`
        SELECT Id, Username, Email, PasswordHash, DisplayName, IsActive,
               LoginAttempts, LockedUntil
        FROM Users
        WHERE (Username = @Username OR Email = @Email) AND IsActive = 1
      `);

    if (userResult.recordset.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials',
      });
    }

    const user = userResult.recordset[0];

    if (user.LockedUntil && new Date() < new Date(user.LockedUntil)) {
      return res.status(423).json({
        success: false,
        error: 'Account is temporarily locked due to multiple failed login attempts',
      });
    }

    const isValidPassword = await verifyPassword(password, user.PasswordHash);

    if (!isValidPassword) {
      const newAttempts = (user.LoginAttempts || 0) + 1;
      const lockUntil =
        newAttempts >= 5 ? new Date(Date.now() + 30 * 60 * 1000) : null;

      await pool
        .request()
        .input('UserId', sql.Int, user.Id)
        .input('LoginAttempts', sql.Int, newAttempts)
        .input('LockedUntil', sql.DateTime2, lockUntil)
        .query(`
          UPDATE Users
          SET LoginAttempts = @LoginAttempts, LockedUntil = @LockedUntil
          WHERE Id = @UserId
        `);

      await pool
        .request()
        .input('UserId', sql.Int, user.Id)
        .input('Action', sql.NVarChar(100), 'LOGIN_FAILED')
        .input('Details', sql.NVarChar(sql.MAX), `Failed login attempt ${newAttempts}`)
        .input('IPAddress', sql.NVarChar(45), req.ip)
        .input('UserAgent', sql.NVarChar(500), req.get('User-Agent') || '')
        .execute('LogUserActivity');

      return res.status(401).json({
        success: false,
        error: 'Invalid credentials',
      });
    }

    await pool
      .request()
      .input('UserId', sql.Int, user.Id)
      .query(`
        UPDATE Users
        SET LoginAttempts = 0, LockedUntil = NULL, LastLoginAt = GETUTCDATE()
        WHERE Id = @UserId
      `);

    const fullUser = await fetchUserWithPermissions(user.Id);
    const tokens = generateTokens(user.Id);

    await pool
      .request()
      .input('UserId', sql.Int, user.Id)
      .input('SessionToken', sql.NVarChar(500), tokens.accessToken)
      .input('RefreshToken', sql.NVarChar(500), tokens.refreshToken)
      .input('IPAddress', sql.NVarChar(45), req.ip)
      .input('UserAgent', sql.NVarChar(500), req.get('User-Agent') || '')
      .input('ExpiresAt', sql.DateTime2, new Date(Date.now() + 24 * 60 * 60 * 1000))
      .query(`
        INSERT INTO UserSessions (UserId, SessionToken, RefreshToken, IPAddress, UserAgent, ExpiresAt)
        VALUES (@UserId, @SessionToken, @RefreshToken, @IPAddress, @UserAgent, @ExpiresAt)
      `);

    await pool
      .request()
      .input('UserId', sql.Int, user.Id)
      .input('Action', sql.NVarChar(100), 'LOGIN_SUCCESS')
      .input('IPAddress', sql.NVarChar(45), req.ip)
      .input('UserAgent', sql.NVarChar(500), req.get('User-Agent') || '')
      .execute('LogUserActivity');

    res.json({
      success: true,
      message: 'Login successful',
      user: fullUser,
      tokens,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Login failed',
    });
  }
});

router.get('/profile', authenticateToken, (req, res) => {
  res.json({
    success: true,
    user: req.user,
  });
});

router.post('/logout', authenticateToken, async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const pool = await getPool();

      await pool
        .request()
        .input('SessionToken', sql.NVarChar(500), token)
        .query(`
          UPDATE UserSessions
          SET IsActive = 0
          WHERE SessionToken = @SessionToken
        `);

      await pool
        .request()
        .input('UserId', sql.Int, req.user.id)
        .input('Action', sql.NVarChar(100), 'LOGOUT')
        .input('IPAddress', sql.NVarChar(45), req.ip)
        .input('UserAgent', sql.NVarChar(500), req.get('User-Agent') || '')
        .execute('LogUserActivity');
    }

    res.json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      error: 'Logout failed',
    });
  }
});

router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body || {};

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        error: 'refreshToken is required',
      });
    }

    let decoded;

    try {
      decoded = jwt.verify(refreshToken, JWT_SECRET);
    } catch (error) {
      return res.status(401).json({
        success: false,
        error: 'Invalid refresh token',
      });
    }

    if (decoded.type !== 'refresh') {
      return res.status(400).json({
        success: false,
        error: 'Invalid token type',
      });
    }

    const pool = await getPool();
    const session = await pool
      .request()
      .input('RefreshToken', sql.NVarChar(500), refreshToken)
      .query(`
        SELECT TOP 1 *
        FROM UserSessions
        WHERE RefreshToken = @RefreshToken AND IsActive = 1 AND ExpiresAt > GETUTCDATE()
      `);

    if (session.recordset.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'Refresh session not found or expired',
      });
    }

    const newTokens = generateTokens(decoded.userId);

    await pool
      .request()
      .input('OldRefreshToken', sql.NVarChar(500), refreshToken)
      .input('NewAccessToken', sql.NVarChar(500), newTokens.accessToken)
      .input('NewRefreshToken', sql.NVarChar(500), newTokens.refreshToken)
      .input('NewExpiresAt', sql.DateTime2, new Date(Date.now() + 24 * 60 * 60 * 1000))
      .query(`
        UPDATE UserSessions
        SET SessionToken = @NewAccessToken, RefreshToken = @NewRefreshToken, ExpiresAt = @NewExpiresAt
        WHERE RefreshToken = @OldRefreshToken AND IsActive = 1
      `);

    res.json({
      success: true,
      tokens: newTokens,
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to refresh token',
    });
  }
});

module.exports = router;
