const express = require('express');
const { getPool, sql } = require('../db');
const {
  authenticateToken,
  requirePermission,
} = require('../middleware/auth');

const router = express.Router();

router.get(
  '/logs/users',
  authenticateToken,
  requirePermission('logs.read'),
  async (req, res) => {
    try {
      const { userId } = req.query;
      const pool = await getPool();

      let query = `
        SELECT a.Id, a.Action, a.Details, a.Timestamp, a.IPAddress, a.UserAgent,
               u.Username, u.Email, u.DisplayName
        FROM ActivityLogs a
        INNER JOIN Users u ON a.UserId = u.Id
        WHERE 1=1
      `;

      const request = pool.request();

      if (userId) {
        query += ' AND a.UserId = @UserId';
        request.input('UserId', sql.Int, userId);
      }

      query += ' ORDER BY a.Timestamp DESC';
      const result = await request.query(query);

      res.json({
        success: true,
        logs: result.recordset,
      });
    } catch (error) {
      console.error('Get logs error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get logs',
      });
    }
  }
);

router.get(
  '/logs/system',
  authenticateToken,
  requirePermission('logs.read'),
  async (req, res) => {
    try {
      const pool = await getPool();
      const result = await pool.request().execute('GetSystemActivityLogs');

      res.json({
        success: true,
        logs: result.recordset,
      });
    } catch (error) {
      console.error('Get system logs error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get system logs',
      });
    }
  }
);

module.exports = router;
