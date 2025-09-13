const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const sql = require('mssql');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
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
        console.log('📋 Debug - DB_USER from env:', process.env.DB_USER);
        console.log('📋 Debug - Actual user being used:', dbConfig.user);
        console.log('📋 Debug - Server being used:', dbConfig.server);
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

// =============================================
// AUTHENTICATION MIDDLEWARE
// =============================================

// JWT Secret (use a strong secret in production)
const JWT_SECRET = process.env.JWT_SECRET || 'fox-shrine-vtuber-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d';

// Authentication middleware
const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({ 
            success: false, 
            error: 'Access token required',
            code: 'NO_TOKEN'
        });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        
        // Get user with current permissions from database
        const pool = await poolPromise;
        const result = await pool.request()
            .input('UserId', sql.Int, decoded.userId)
            .execute('GetUserWithPermissions');

        if (result.recordset.length === 0) {
            return res.status(401).json({ 
                success: false, 
                error: 'User not found or inactive',
                code: 'USER_NOT_FOUND'
            });
        }

        const user = result.recordset[0];
        req.user = {
            id: user.Id,
            username: user.Username,
            email: user.Email,
            displayName: user.DisplayName,
            role: user.RoleName,
            permissions: user.Permissions ? user.Permissions.split(',') : []
        };

        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ 
                success: false, 
                error: 'Token expired',
                code: 'TOKEN_EXPIRED'
            });
        } else if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ 
                success: false, 
                error: 'Invalid token',
                code: 'INVALID_TOKEN'
            });
        }
        
        console.error('Authentication error:', error);
        return res.status(500).json({ 
            success: false, 
            error: 'Authentication failed',
            code: 'AUTH_ERROR'
        });
    }
};

// Permission middleware
const requirePermission = (permission) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ 
                success: false, 
                error: 'Authentication required',
                code: 'NOT_AUTHENTICATED'
            });
        }

        if (!req.user.permissions.includes(permission)) {
            return res.status(403).json({ 
                success: false, 
                error: `Permission '${permission}' required`,
                code: 'INSUFFICIENT_PERMISSIONS',
                required: permission,
                userPermissions: req.user.permissions
            });
        }

        next();
    };
};

// Optional authentication middleware (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        req.user = null;
        return next();
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        
        const pool = await poolPromise;
        const result = await pool.request()
            .input('UserId', sql.Int, decoded.userId)
            .execute('GetUserWithPermissions');

        if (result.recordset.length > 0) {
            const user = result.recordset[0];
            req.user = {
                id: user.Id,
                username: user.Username,
                email: user.Email,
                displayName: user.DisplayName,
                role: user.RoleName,
                permissions: user.Permissions ? user.Permissions.split(',') : []
            };
        } else {
            req.user = null;
        }
    } catch (error) {
        req.user = null;
    }

    next();
};

// Utility function to generate tokens
const generateTokens = (userId) => {
    const accessToken = jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    const refreshToken = jwt.sign({ userId, type: 'refresh' }, JWT_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRES_IN });
    return { accessToken, refreshToken };
};

// Utility function to hash passwords
const hashPassword = async (password) => {
    const saltRounds = 12;
    return await bcrypt.hash(password, saltRounds);
};

// Utility function to verify passwords
const verifyPassword = async (password, hash) => {
    return await bcrypt.compare(password, hash);
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

// =============================================
// AUTHENTICATION ENDPOINTS
// =============================================

// User registration
app.post('/api/auth/register', async (req, res) => {
    try {
        const { username, email, password, displayName } = req.body;

        // Validation
        if (!username || !email || !password) {
            return res.status(400).json({
                success: false,
                error: 'Username, email, and password are required'
            });
        }

        // Password strength validation
        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                error: 'Password must be at least 8 characters long'
            });
        }

        // Hash password
        const passwordHash = await hashPassword(password);

        // Create user
        const pool = await poolPromise;
        const result = await pool.request()
            .input('Username', sql.NVarChar(50), username)
            .input('Email', sql.NVarChar(255), email)
            .input('PasswordHash', sql.NVarChar(255), passwordHash)
            .input('DisplayName', sql.NVarChar(100), displayName || username)
            .input('RoleName', sql.NVarChar(50), 'Member')
            .input('CreatedBy', sql.NVarChar(100), 'self-registration')
            .execute('CreateUser');

        const user = result.recordset[0];
        const tokens = generateTokens(user.Id);

        // Create session
        await pool.request()
            .input('UserId', sql.Int, user.Id)
            .input('SessionToken', sql.NVarChar(500), tokens.accessToken)
            .input('RefreshToken', sql.NVarChar(500), tokens.refreshToken)
            .input('IPAddress', sql.NVarChar(45), req.ip)
            .input('UserAgent', sql.NVarChar(500), req.get('User-Agent') || '')
            .input('ExpiresAt', sql.DateTime2, new Date(Date.now() + 24 * 60 * 60 * 1000)) // 24 hours
            .query(`
                INSERT INTO UserSessions (UserId, SessionToken, RefreshToken, IPAddress, UserAgent, ExpiresAt)
                VALUES (@UserId, @SessionToken, @RefreshToken, @IPAddress, @UserAgent, @ExpiresAt)
            `);

        // Log activity
        await pool.request()
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
                role: user.RoleName
            },
            tokens
        });

    } catch (error) {
        console.error('Registration error:', error);
        
        if (error.number === 2627) { // Unique constraint violation
            return res.status(409).json({
                success: false,
                error: 'Username or email already exists'
            });
        }

        res.status(500).json({
            success: false,
            error: 'Registration failed'
        });
    }
});

// User login
app.post('/api/auth/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                success: false,
                error: 'Username and password are required'
            });
        }

        const pool = await poolPromise;
        
        // Get user by username or email
        const userResult = await pool.request()
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
                error: 'Invalid credentials'
            });
        }

        const user = userResult.recordset[0];

        // Check if account is locked
        if (user.LockedUntil && new Date() < new Date(user.LockedUntil)) {
            return res.status(423).json({
                success: false,
                error: 'Account is temporarily locked due to multiple failed login attempts'
            });
        }

        // Verify password
        const isValidPassword = await verifyPassword(password, user.PasswordHash);

        if (!isValidPassword) {
            // Increment login attempts
            const newAttempts = (user.LoginAttempts || 0) + 1;
            const lockUntil = newAttempts >= 5 ? new Date(Date.now() + 30 * 60 * 1000) : null; // Lock for 30 minutes

            await pool.request()
                .input('UserId', sql.Int, user.Id)
                .input('LoginAttempts', sql.Int, newAttempts)
                .input('LockedUntil', sql.DateTime2, lockUntil)
                .query(`
                    UPDATE Users 
                    SET LoginAttempts = @LoginAttempts, LockedUntil = @LockedUntil
                    WHERE Id = @UserId
                `);

            // Log failed attempt
            await pool.request()
                .input('UserId', sql.Int, user.Id)
                .input('Action', sql.NVarChar(100), 'LOGIN_FAILED')
                .input('Details', sql.NVarChar(sql.MAX), `Failed login attempt ${newAttempts}`)
                .input('IPAddress', sql.NVarChar(45), req.ip)
                .input('UserAgent', sql.NVarChar(500), req.get('User-Agent') || '')
                .execute('LogUserActivity');

            return res.status(401).json({
                success: false,
                error: 'Invalid credentials'
            });
        }

        // Reset login attempts on successful login
        await pool.request()
            .input('UserId', sql.Int, user.Id)
            .query(`
                UPDATE Users 
                SET LoginAttempts = 0, LockedUntil = NULL, LastLoginAt = GETUTCDATE()
                WHERE Id = @UserId
            `);

        // Get user with permissions
        const userWithPermissions = await pool.request()
            .input('UserId', sql.Int, user.Id)
            .execute('GetUserWithPermissions');

        const fullUser = userWithPermissions.recordset[0];
        const tokens = generateTokens(user.Id);

        // Create session
        await pool.request()
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

        // Log successful login
        await pool.request()
            .input('UserId', sql.Int, user.Id)
            .input('Action', sql.NVarChar(100), 'LOGIN_SUCCESS')
            .input('IPAddress', sql.NVarChar(45), req.ip)
            .input('UserAgent', sql.NVarChar(500), req.get('User-Agent') || '')
            .execute('LogUserActivity');

        res.json({
            success: true,
            message: 'Login successful',
            user: {
                id: fullUser.Id,
                username: fullUser.Username,
                email: fullUser.Email,
                displayName: fullUser.DisplayName,
                role: fullUser.RoleName,
                permissions: fullUser.Permissions ? fullUser.Permissions.split(',') : []
            },
            tokens
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            error: 'Login failed'
        });
    }
});

// Get current user profile
app.get('/api/auth/profile', authenticateToken, async (req, res) => {
    try {
        res.json({
            success: true,
            user: req.user
        });
    } catch (error) {
        console.error('Profile error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get user profile'
        });
    }
});

// Logout
app.post('/api/auth/logout', authenticateToken, async (req, res) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (token) {
            const pool = await poolPromise;
            
            // Deactivate session
            await pool.request()
                .input('SessionToken', sql.NVarChar(500), token)
                .query(`
                    UPDATE UserSessions 
                    SET IsActive = 0 
                    WHERE SessionToken = @SessionToken
                `);

            // Log logout
            await pool.request()
                .input('UserId', sql.Int, req.user.id)
                .input('Action', sql.NVarChar(100), 'LOGOUT')
                .input('IPAddress', sql.NVarChar(45), req.ip)
                .input('UserAgent', sql.NVarChar(500), req.get('User-Agent') || '')
                .execute('LogUserActivity');
        }

        res.json({
            success: true,
            message: 'Logged out successfully'
        });

    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            success: false,
            error: 'Logout failed'
        });
    }
});

// =============================================
// USER MANAGEMENT ENDPOINTS (Admin Only)
// =============================================

// Get all users (Admin only)
app.get('/api/admin/users', authenticateToken, requirePermission('users.read'), async (req, res) => {
    try {
        const { page = 1, limit = 10, role, search } = req.query;
        const offset = (page - 1) * limit;

        const pool = await poolPromise;
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
            query += ` AND r.Name = @Role`;
            request.input('Role', sql.NVarChar(50), role);
        }

        if (search) {
            query += ` AND (u.Username LIKE @Search OR u.Email LIKE @Search OR u.DisplayName LIKE @Search)`;
            request.input('Search', sql.NVarChar(255), `%${search}%`);
        }

        query += ` ORDER BY u.CreatedAt DESC OFFSET @Offset ROWS FETCH NEXT @Limit ROWS ONLY`;
        request.input('Offset', sql.Int, offset);
        request.input('Limit', sql.Int, parseInt(limit));

        const result = await request.query(query);

        // Get total count
        let countQuery = `SELECT COUNT(*) as Total FROM Users u INNER JOIN Roles r ON u.RoleId = r.Id WHERE 1=1`;
        const countRequest = pool.request();

        if (role) {
            countQuery += ` AND r.Name = @Role`;
            countRequest.input('Role', sql.NVarChar(50), role);
        }

        if (search) {
            countQuery += ` AND (u.Username LIKE @Search OR u.Email LIKE @Search OR u.DisplayName LIKE @Search)`;
            countRequest.input('Search', sql.NVarChar(255), `%${search}%`);
        }

        const countResult = await countRequest.query(countQuery);

        res.json({
            success: true,
            users: result.recordset,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: countResult.recordset[0].Total,
                pages: Math.ceil(countResult.recordset[0].Total / limit)
            }
        });

    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get users'
        });
    }
});

// Update user role (Admin only)
app.put('/api/admin/users/:id/role', authenticateToken, requirePermission('users.roles'), async (req, res) => {
    try {
        const { id } = req.params;
        const { roleName } = req.body;

        if (!roleName) {
            return res.status(400).json({
                success: false,
                error: 'Role name is required'
            });
        }

        const pool = await poolPromise;
        const result = await pool.request()
            .input('UserId', sql.Int, id)
            .input('RoleName', sql.NVarChar(50), roleName)
            .input('UpdatedBy', sql.NVarChar(100), req.user.username)
            .execute('UpdateUserRole');

        if (result.recordset.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        res.json({
            success: true,
            message: 'User role updated successfully',
            user: result.recordset[0]
        });

    } catch (error) {
        console.error('Update user role error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update user role'
        });
    }
});

// Get all roles with permissions (Admin only)
app.get('/api/admin/roles', authenticateToken, requirePermission('users.roles'), async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().execute('GetRolesWithPermissions');

        res.json({
            success: true,
            roles: result.recordset
        });

    } catch (error) {
        console.error('Get roles error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get roles'
        });
    }
});

// Get all active configuration (guests can read, but with optional auth for logging)
app.get('/api/config', optionalAuth, async (req, res) => {
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
        
        // Log access if user is authenticated
        if (req.user) {
            const pool2 = await poolPromise;
            await pool2.request()
                .input('UserId', sql.Int, req.user.id)
                .input('Action', sql.NVarChar(100), 'CONFIG_READ')
                .input('Details', sql.NVarChar(sql.MAX), 'Read all configuration')
                .input('IPAddress', sql.NVarChar(45), req.ip)
                .input('UserAgent', sql.NVarChar(500), req.get('User-Agent') || '')
                .execute('LogUserActivity');
        }

        res.json({
            success: true,
            data: config,
            timestamp: new Date().toISOString(),
            count: result.recordset.length,
            user: req.user ? { role: req.user.role, username: req.user.username } : null
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

// Get configuration by category (guests can read, but with optional auth for logging)
app.get('/api/config/:category', optionalAuth, async (req, res) => {
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

// Bulk update configuration (Admin only)
app.put('/api/config', authenticateToken, requirePermission('config.write'), async (req, res) => {
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
                .input('UpdatedBy', sql.NVarChar(100), req.user.username || 'api')
                .execute('UpsertConfiguration');
            
            results.push(result.recordset[0]);
        }
        
        // Log user activity
        const pool2 = await poolPromise;
        await pool2.request()
            .input('UserId', sql.Int, req.user.id)
            .input('Action', sql.NVarChar(100), 'CONFIG_BULK_UPDATE')
            .input('Details', sql.NVarChar(sql.MAX), `Updated ${results.length} configurations`)
            .input('IPAddress', sql.NVarChar(45), req.ip)
            .input('UserAgent', sql.NVarChar(500), req.get('User-Agent') || '')
            .execute('LogUserActivity');
        
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

// Delete configuration (Admin only)
app.delete('/api/config/:key', authenticateToken, requirePermission('config.delete'), async (req, res) => {
    try {
        const { key } = req.params;
        
        const pool = await poolPromise;
        const result = await pool.request()
            .input('Key', sql.NVarChar(100), key)
            .input('UpdatedBy', sql.NVarChar(100), req.user.username || 'api')
            .query(`
                UPDATE Configuration 
                SET IsActive = 0, UpdatedBy = @UpdatedBy, UpdatedAt = GETUTCDATE()
                OUTPUT DELETED.Key, DELETED.Value, DELETED.Category
                WHERE [Key] = @Key AND IsActive = 1
            `);
        
        if (result.recordset.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Configuration not found',
                timestamp: new Date().toISOString()
            });
        }
        
        // Log user activity
        const pool2 = await poolPromise;
        await pool2.request()
            .input('UserId', sql.Int, req.user.id)
            .input('Action', sql.NVarChar(100), 'CONFIG_DELETE')
            .input('Details', sql.NVarChar(sql.MAX), `Deleted configuration key: ${key}`)
            .input('IPAddress', sql.NVarChar(45), req.ip)
            .input('UserAgent', sql.NVarChar(500), req.get('User-Agent') || '')
            .execute('LogUserActivity');
        
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
