const jwt = require('jsonwebtoken');
const { getPool, sql } = require('../db');
const { JWT_SECRET } = require('../config');

const mapUserRecord = (record) => ({
  id: record.Id,
  username: record.Username,
  email: record.Email,
  displayName: record.DisplayName,
  role: record.RoleName,
  permissions: record.Permissions ? record.Permissions.split(',') : [],
});

const fetchUserWithPermissions = async (userId) => {
  const pool = await getPool();
  const result = await pool
    .request()
    .input('UserId', sql.Int, userId)
    .execute('GetUserWithPermissions');

  return result.recordset[0] ? mapUserRecord(result.recordset[0]) : null;
};

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Access token required',
      code: 'NO_TOKEN',
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await fetchUserWithPermissions(decoded.userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'User not found or inactive',
        code: 'USER_NOT_FOUND',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Token expired',
        code: 'TOKEN_EXPIRED',
      });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: 'Invalid token',
        code: 'INVALID_TOKEN',
      });
    }

    console.error('Authentication error:', error);
    return res.status(500).json({
      success: false,
      error: 'Authentication failed',
      code: 'AUTH_ERROR',
    });
  }
};

const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await fetchUserWithPermissions(decoded.userId);
    req.user = user || null;
  } catch (error) {
    req.user = null;
  }

  next();
};

const requirePermission = (permission) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required',
      code: 'NOT_AUTHENTICATED',
    });
  }

  if (!req.user.permissions.includes(permission)) {
    return res.status(403).json({
      success: false,
      error: `Permission '${permission}' required`,
      code: 'INSUFFICIENT_PERMISSIONS',
      required: permission,
      userPermissions: req.user.permissions,
    });
  }

  next();
};

module.exports = {
  authenticateToken,
  optionalAuth,
  requirePermission,
  fetchUserWithPermissions,
};
