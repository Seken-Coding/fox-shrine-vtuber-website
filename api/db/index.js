const sql = require('mssql');

const dbConfig = {
  user: process.env.DB_USER || 'testachong',
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER || 'testachong.database.windows.net',
  database: process.env.DB_NAME || 'Vtuber_Website',
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
  options: {
    encrypt: true,
    trustServerCertificate: false,
    enableArithAbort: true,
  },
  connectionTimeout: 30000,
  requestTimeout: 30000,
};

let connectionPool = null;

const getPool = async () => {
  if (!connectionPool) {
    try {
      console.log('🔄 Connecting to Azure SQL Database...');
      console.log('📋 Debug - DB_USER from env:', process.env.DB_USER);
      console.log('📋 Debug - Actual user being used:', dbConfig.user);
      console.log('📋 Debug - Server being used:', dbConfig.server);

      const pool = await new sql.ConnectionPool(dbConfig).connect();
      const versionResult = await pool.request().query('SELECT @@VERSION as version');

      console.log('✅ Connected to Azure SQL Database successfully!');
      console.log('📊 Database Version:', versionResult.recordset[0].version.split('\n')[0]);

      connectionPool = pool;
    } catch (error) {
      console.error('❌ Database connection failed:', error.message);
      connectionPool = null;
      throw error;
    }
  }

  return connectionPool;
};

const initializeDatabase = async () => {
  await getPool();
};

module.exports = {
  sql,
  dbConfig,
  getPool,
  initializeDatabase,
};
