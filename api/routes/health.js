const express = require('express');
const { getPool } = require('../db');

const router = express.Router();

router.get('/health', async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request().query('SELECT 1 as status');

    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: result.recordset[0].status === 1 ? 'connected' : 'disconnected',
      uptime: process.uptime(),
      version: '1.0.0',
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message,
      uptime: process.uptime(),
      version: '1.0.0',
    });
  }
});

router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'API is working',
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
