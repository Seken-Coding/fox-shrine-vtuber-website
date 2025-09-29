const { getPool, sql } = require('../db');

const logAuditTrail = async (req, action, details) => {
  try {
    if (req && req.user && req.user.id) {
      const pool = await getPool();
      await pool
        .request()
        .input('UserId', sql.Int, req.user.id)
        .input('Action', sql.NVarChar(100), action)
        .input('Details', sql.NVarChar(sql.MAX), details || '')
        .input('IPAddress', sql.NVarChar(45), req.ip)
        .input('UserAgent', sql.NVarChar(500), req.get('User-Agent') || '')
        .execute('LogUserActivity');
    } else {
      console.log(`[AUDIT] ${new Date().toISOString()} ${action} - ${details}`);
    }
  } catch (error) {
    console.error('Audit trail logging failed:', error.message);
  }
};

module.exports = {
  logAuditTrail,
};
