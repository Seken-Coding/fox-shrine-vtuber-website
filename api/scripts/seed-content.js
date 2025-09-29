// Simple content seeding helper to run seed-content-config.sql using mssql
// Reads DB_* from environment or .env

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const fs = require('fs');
const path = require('path');
const sql = require('mssql');

(async () => {
  const dbConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_NAME,
    pool: { max: 5, min: 0, idleTimeoutMillis: 30000 },
    options: { encrypt: true, trustServerCertificate: false, enableArithAbort: true },
    connectionTimeout: 30000,
    requestTimeout: 30000,
  };

  if (!dbConfig.user || !dbConfig.password || !dbConfig.server || !dbConfig.database) {
    console.error('Missing DB_* env vars. Please set DB_USER, DB_PASSWORD, DB_SERVER, DB_NAME.');
    process.exit(1);
  }

  const sqlFile = path.join(__dirname, '..', 'seed-content-config.sql');
  if (!fs.existsSync(sqlFile)) {
    console.error('seed-content-config.sql not found.');
    process.exit(1);
  }

  const script = fs.readFileSync(sqlFile, 'utf8');

  try {
    console.log('Connecting to database...');
    const pool = new sql.ConnectionPool(dbConfig);
    await pool.connect();
    console.log('Connected. Running seed script...');

    // Split on GO batches if present (simple splitter)
    const batches = script.split(/\nGO\n|\r\nGO\r\n|\rGO\r/gi).map(s => s.trim()).filter(Boolean);
    for (const [i, batch] of batches.entries()) {
      await pool.request().query(batch);
      console.log(`Executed batch ${i + 1}/${batches.length}`);
    }

    console.log('Seeding completed successfully.');
    await pool.close();
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err.message);
    process.exit(1);
  }
})();
