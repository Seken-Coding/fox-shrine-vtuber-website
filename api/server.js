const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const sql = require('mssql');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3002;

// Security middleware
app.use(helmet({
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            imgSrc: ["'self'", "data:", "https:"],
            scriptSrc: ["'self'"],
        },
    },
}));

// Compression middleware
app.use(compression());

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: {
        error: 'Too many requests from this IP, please try again later.',
        statusCode: 429
    }
});
app.use('/api/', limiter);

// CORS configuration
const corsOptions = {
    origin: [
        'http://localhost:3000',
        'http://localhost:3001',
        'https://foxshrinevtuber.com',
        'https://www.foxshrinevtuber.com'
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true
};
app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Azure SQL Database configuration
const dbConfig = {
    user: process.env.DB_USER || 'testachong',
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER || 'testachong.database.windows.net',
    database: process.env.DB_NAME || 'Vtuber_Website',
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
    },
    options: {
        encrypt: true, // Use encryption
        trustServerCertificate: false, // Change to true for local dev / self-signed certs
        enableArithAbort: true
    },
    connectionTimeout: 30000,
    requestTimeout: 30000
};

// Database connection pool
let poolPromise;

const initializeDatabase = async () => {
    try {
        console.log('🔄 Connecting to Azure SQL Database...');
        poolPromise = new sql.ConnectionPool(dbConfig);
        await poolPromise.connect();
        console.log('✅ Connected to Azure SQL Database successfully!');
        
        // Test the connection
        const result = await poolPromise.request().query('SELECT @@VERSION as version');
        console.log('📊 Database Version:', result.recordset[0].version.split('\n')[0]);
        
        return poolPromise;
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        throw error;
    }
};

// Health check endpoint
app.get('/api/health', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query('SELECT 1 as status');
        
        res.json({
            status: 'healthy',
            timestamp: new Date().toISOString(),
            database: result.recordset[0].status === 1 ? 'connected' : 'disconnected',
            uptime: process.uptime(),
            version: '1.0.0'
        });
    } catch (error) {
        res.status(503).json({
            status: 'unhealthy',
            timestamp: new Date().toISOString(),
            error: error.message,
            uptime: process.uptime(),
            version: '1.0.0'
        });
    }
});

// Get all active configuration
app.get('/api/config', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().execute('GetActiveConfiguration');
        
        // Transform to key-value object
        const config = {};
        result.recordset.forEach(row => {
            // Handle nested object notation (e.g., "character.name")
            const keys = row.Key.split('.');
            let current = config;
            
            for (let i = 0; i < keys.length - 1; i++) {
                if (!current[keys[i]]) {
                    current[keys[i]] = {};
                }
                current = current[keys[i]];
            }
            
            current[keys[keys.length - 1]] = row.Value;
        });
        
        res.json({
            success: true,
            data: config,
            timestamp: new Date().toISOString(),
            count: result.recordset.length
        });
    } catch (error) {
        console.error('Config fetch error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch configuration',
            message: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// Get configuration by category
app.get('/api/config/:category', async (req, res) => {
    try {
        const { category } = req.params;
        const pool = await poolPromise;
        const result = await pool.request()
            .input('Category', sql.NVarChar(50), category)
            .execute('GetConfigurationByCategory');
        
        const config = {};
        result.recordset.forEach(row => {
            const keys = row.Key.split('.');
            let current = config;
            
            for (let i = 0; i < keys.length - 1; i++) {
                if (!current[keys[i]]) {
                    current[keys[i]] = {};
                }
                current = current[keys[i]];
            }
            
            current[keys[keys.length - 1]] = row.Value;
        });
        
        res.json({
            success: true,
            data: config,
            category: category,
            timestamp: new Date().toISOString(),
            count: result.recordset.length
        });
    } catch (error) {
        console.error('Config category fetch error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch configuration by category',
            message: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// Update configuration
app.put('/api/config/:key', async (req, res) => {
    try {
        const { key } = req.params;
        const { value, category = 'general', description } = req.body;
        
        if (!value && value !== '') {
            return res.status(400).json({
                success: false,
                error: 'Value is required',
                timestamp: new Date().toISOString()
            });
        }
        
        const pool = await poolPromise;
        const result = await pool.request()
            .input('Key', sql.NVarChar(100), key)
            .input('Value', sql.NVarChar(sql.MAX), String(value))
            .input('Category', sql.NVarChar(50), category)
            .input('Description', sql.NVarChar(500), description)
            .input('UpdatedBy', sql.NVarChar(100), req.ip || 'api')
            .execute('UpsertConfiguration');
        
        // Log the audit trail
        await logAuditTrail(req, 'UPDATE_CONFIG', `Updated ${key} = ${value}`);
        
        res.json({
            success: true,
            data: result.recordset[0],
            message: 'Configuration updated successfully',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Config update error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update configuration',
            message: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// Bulk update configuration
app.put('/api/config', async (req, res) => {
    try {
        const { configs } = req.body;
        
        if (!Array.isArray(configs)) {
            return res.status(400).json({
                success: false,
                error: 'configs must be an array',
                timestamp: new Date().toISOString()
            });
        }
        
        const pool = await poolPromise;
        const results = [];
        
        // Process each configuration update
        for (const config of configs) {
            const { key, value, category = 'general', description } = config;
            
            if (!key || (!value && value !== '')) {
                continue; // Skip invalid entries
            }
            
            const result = await pool.request()
                .input('Key', sql.NVarChar(100), key)
                .input('Value', sql.NVarChar(sql.MAX), String(value))
                .input('Category', sql.NVarChar(50), category)
                .input('Description', sql.NVarChar(500), description)
                .input('UpdatedBy', sql.NVarChar(100), req.ip || 'api')
                .execute('UpsertConfiguration');
            
            results.push(result.recordset[0]);
        }
        
        // Log the audit trail
        await logAuditTrail(req, 'BULK_UPDATE_CONFIG', `Updated ${results.length} configurations`);
        
        res.json({
            success: true,
            data: results,
            message: `Updated ${results.length} configurations successfully`,
            timestamp: new Date().toISOString(),
            count: results.length
        });
    } catch (error) {
        console.error('Bulk config update error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update configurations',
            message: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// Delete configuration
app.delete('/api/config/:key', async (req, res) => {
    try {
        const { key } = req.params;
        
        const pool = await poolPromise;
        const result = await pool.request()
            .input('Key', sql.NVarChar(100), key)
            .query(`
                UPDATE Configuration 
                SET IsActive = 0, UpdatedBy = @UpdatedBy, UpdatedAt = GETUTCDATE()
                OUTPUT DELETED.Key, DELETED.Value, DELETED.Category
                WHERE [Key] = @Key AND IsActive = 1
            `)
            .input('UpdatedBy', sql.NVarChar(100), req.ip || 'api');
        
        if (result.recordset.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Configuration not found',
                timestamp: new Date().toISOString()
            });
        }
        
        // Log the audit trail
        await logAuditTrail(req, 'DELETE_CONFIG', `Deleted ${key}`);
        
        res.json({
            success: true,
            data: result.recordset[0],
            message: 'Configuration deleted successfully',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Config delete error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete configuration',
            message: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// Get configuration audit trail
app.get('/api/config/audit/:key?', async (req, res) => {
    try {
        const { key } = req.params;
        const { days = 30 } = req.query;
        
        const pool = await poolPromise;
        const result = await pool.request()
            .input('ConfigurationKey', sql.NVarChar(100), key || null)
            .input('Days', sql.Int, parseInt(days))
            .execute('GetConfigurationAudit');
        
        res.json({
            success: true,
            data: result.recordset,
            key: key,
            days: parseInt(days),
            timestamp: new Date().toISOString(),
            count: result.recordset.length
        });
    } catch (error) {
        console.error('Config audit fetch error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch configuration audit',
            message: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// Stream status endpoints
app.get('/api/stream/status', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('Category', sql.NVarChar(50), 'stream')
            .execute('GetConfigurationByCategory');
        
        const streamData = {};
        result.recordset.forEach(row => {
            streamData[row.Key] = row.Value;
        });
        
        res.json({
            success: true,
            data: {
                isLive: streamData.isLive === 'true',
                title: streamData.streamTitle,
                category: streamData.streamCategory,
                nextStream: streamData.nextStreamDate,
                notification: streamData.streamNotification
            },
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Stream status fetch error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch stream status',
            message: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// Update stream status
app.put('/api/stream/status', async (req, res) => {
    try {
        const { isLive, title, category, nextStream, notification } = req.body;
        const pool = await poolPromise;
        
        const updates = [];
        if (typeof isLive === 'boolean') {
            updates.push({ key: 'isLive', value: isLive.toString() });
        }
        if (title) {
            updates.push({ key: 'streamTitle', value: title });
        }
        if (category) {
            updates.push({ key: 'streamCategory', value: category });
        }
        if (nextStream) {
            updates.push({ key: 'nextStreamDate', value: nextStream });
        }
        if (notification) {
            updates.push({ key: 'streamNotification', value: notification });
        }
        
        const results = [];
        for (const update of updates) {
            const result = await pool.request()
                .input('Key', sql.NVarChar(100), update.key)
                .input('Value', sql.NVarChar(sql.MAX), update.value)
                .input('Category', sql.NVarChar(50), 'stream')
                .input('UpdatedBy', sql.NVarChar(100), req.ip || 'api')
                .execute('UpsertConfiguration');
            
            results.push(result.recordset[0]);
        }
        
        // Log the audit trail
        await logAuditTrail(req, 'UPDATE_STREAM_STATUS', `Updated stream status`);
        
        res.json({
            success: true,
            data: results,
            message: 'Stream status updated successfully',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Stream status update error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update stream status',
            message: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// Helper function for audit logging
async function logAuditTrail(req, action, details) {
    try {
        const pool = await poolPromise;
        await pool.request()
            .input('Action', sql.NVarChar(20), action)
            .input('Details', sql.NVarChar(500), details)
            .input('IPAddress', sql.NVarChar(45), req.ip)
            .input('UserAgent', sql.NVarChar(500), req.get('User-Agent'))
            .query(`
                INSERT INTO ConfigurationAudit (Action, NewValue, ChangedBy, IPAddress, UserAgent)
                VALUES (@Action, @Details, @IPAddress, @IPAddress, @UserAgent)
            `);
    } catch (error) {
        console.error('Audit logging error:', error);
        // Don't throw error for audit logging failures
    }
}

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Unhandled error:', error);
    res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong',
        timestamp: new Date().toISOString()
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        error: 'Endpoint not found',
        path: req.originalUrl,
        timestamp: new Date().toISOString()
    });
});

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('🔄 Shutting down gracefully...');
    try {
        if (poolPromise) {
            await poolPromise.close();
            console.log('✅ Database connection closed');
        }
        process.exit(0);
    } catch (error) {
        console.error('❌ Error during shutdown:', error);
        process.exit(1);
    }
});

// Start server
const startServer = async () => {
    try {
        // Initialize database connection
        await initializeDatabase();
        
        // Start the server
        app.listen(PORT, () => {
            console.log('🦊 Fox Shrine VTuber API Server Started!');
            console.log(`📡 Server running on port ${PORT}`);
            console.log(`🌐 Health check: http://localhost:${PORT}/api/health`);
            console.log(`⚙️  Configuration API: http://localhost:${PORT}/api/config`);
            console.log(`📺 Stream API: http://localhost:${PORT}/api/stream/status`);
            console.log(`🔍 Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log('=====================================');
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
};

// Start the server
startServer();
