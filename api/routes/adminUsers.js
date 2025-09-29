const express = require('express');
const { getPool, sql } = require('../db');
const {
  authenticateToken,
  requirePermission,
} = require('../middleware/auth');
const { validate, roleUpdateSchema } = require('../middleware/validation');

const router = express.Router();

router.get(
  '/users',
  authenticateToken,
  requirePermission('users.read'),
  async (req, res) => {
    try {
      const { page = 1, limit = 10, role, search } = req.query;
      const offset = (Number(page) - 1) * Number(limit);
      const pool = await getPool();

      let query = `
        SELECT u.Id, u.Username, u.Email, u.DisplayName, u.Avatar,
               u.IsActive, u.IsEmailVerified, u.LastLoginAt, u.CreatedAt,
               r.Name as RoleName, r.Description as RoleDescription
        FROM Users u
        INNER JOIN Roles r ON u.RoleId = r.Id
        WHERE 1=1
      `;

      const request = pool.request();

      if (role) {
        query += ' AND r.Name = @Role';
        request.input('Role', sql.NVarChar(50), role);
      }

      if (search) {
        query += ` AND (u.Username LIKE @Search OR u.Email LIKE @Search OR u.DisplayName LIKE @Search)`;
        request.input('Search', sql.NVarChar(255), `%${search}%`);
      }

      query += ' ORDER BY u.CreatedAt DESC OFFSET @Offset ROWS FETCH NEXT @Limit ROWS ONLY';
      request.input('Offset', sql.Int, offset);
      request.input('Limit', sql.Int, Number(limit));

      const result = await request.query(query);

      let countQuery = `
        SELECT COUNT(*) as Total
        FROM Users u
        INNER JOIN Roles r ON u.RoleId = r.Id
        WHERE 1=1
      `;

      const countRequest = pool.request();

      if (role) {
        countQuery += ' AND r.Name = @Role';
        countRequest.input('Role', sql.NVarChar(50), role);
      }

      if (search) {
        countQuery += ` AND (u.Username LIKE @Search OR u.Email LIKE @Search OR u.DisplayName LIKE @Search)`;
        countRequest.input('Search', sql.NVarChar(255), `%${search}%`);
      }

      const countResult = await countRequest.query(countQuery);
      const total = countResult.recordset[0].Total;

      res.json({
        success: true,
        users: result.recordset,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit)),
        },
      });
    } catch (error) {
      console.error('Get users error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get users',
      });
    }
  }
);

router.put(
  '/users/:id/role',
  authenticateToken,
  requirePermission('users.roles'),
  validate(roleUpdateSchema),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { roleName } = req.body;

      if (!roleName) {
        return res.status(400).json({
          success: false,
          error: 'Role name is required',
        });
      }

      const pool = await getPool();
      const result = await pool
        .request()
        .input('UserId', sql.Int, id)
        .input('RoleName', sql.NVarChar(50), roleName)
        .input('UpdatedBy', sql.NVarChar(100), req.user.username)
        .execute('UpdateUserRole');

      if (result.recordset.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'User not found',
        });
      }

      res.json({
        success: true,
        message: 'User role updated successfully',
        user: result.recordset[0],
      });
    } catch (error) {
      console.error('Update user role error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update user role',
      });
    }
  }
);

router.get(
  '/roles',
  authenticateToken,
  requirePermission('users.roles'),
  async (req, res) => {
    try {
      const pool = await getPool();
      const result = await pool.request().execute('GetRolesWithPermissions');

      res.json({
        success: true,
        roles: result.recordset,
      });
    } catch (error) {
      console.error('Get roles error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get roles',
      });
    }
  }
);

module.exports = router;
