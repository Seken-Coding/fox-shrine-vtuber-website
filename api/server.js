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
const { validate, userRegistrationSchema, userLoginSchema, roleUpdateSchema } = require('./middleware/validation');
const Joi = require('joi');

const app = express();
const PORT = process.env.PORT || 3002;

// Trust Render/hosting proxy so client IPs are derived from X-Forwarded-* headers
// This must be set before any middleware that relies on req.ip (e.g., rate limiter)
app.set('trust proxy', 1);

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
            connectSrc: [
                "'self'",
                ...(process.env.NODE_ENV === 'production' ? [
                    'https://fox-shrine-vtuber-website.onrender.com',
                    'https://fox-shrine-vtuber-website.vercel.app'
                ] : [
                    'http://localhost:3000',
                    'http://localhost:3001',
                    'http://localhost:3002'
                ])
            ],
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
const defaultProdOrigins = [
    'https://foxshrinevtuber.com',
    'https://www.foxshrinevtuber.com',
    'https://fox-shrine-vtuber-website.vercel.app',
    'https://www.mei-satsuki.net',
    'https://mei-satsuki.net',
];

const envOrigins = process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(',').map(o => o.trim()).filter(Boolean)
    : null;

const allowedOrigins = process.env.NODE_ENV === 'production'
    ? ((envOrigins && envOrigins.length) ? envOrigins : defaultProdOrigins)
    : [
        'http://localhost:3000',
        'http://localhost:3001',
        'http://localhost:3002'
      ];

const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (curl, server-to-server)
        if (!origin) return callback(null, true);
        const isAllowed = allowedOrigins.includes(origin);
        return callback(isAllowed ? null : new Error(`CORS origin not allowed: ${origin}`), isAllowed);
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true,
    optionsSuccessStatus: 204,
};
app.use(cors(corsOptions));
// Ensure preflight across-the-board is handled
app.options('*', cors(corsOptions));

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

// Fail-fast in production if using a weak or default secret
if (process.env.NODE_ENV === 'production' && (!process.env.JWT_SECRET || JWT_SECRET === 'fox-shrine-vtuber-secret-key-change-in-production')) {
    console.error('FATAL: JWT_SECRET is missing or using default in production. Set a strong JWT_SECRET.');
    process.exit(1);
}

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

// =============================================
// AUDIT TRAIL HELPER
// =============================================
/**
 * Logs an audit trail for important system actions. If a user is authenticated,
 * this records a user activity via LogUserActivity. Otherwise, it logs to console
 * to avoid database dependency assumptions on a separate system logs table.
 */
const logAuditTrail = async (req, action, details) => {
    try {
        if (req && req.user && req.user.id) {
            const pool = await poolPromise;
            await pool.request()
                .input('UserId', sql.Int, req.user.id)
                .input('Action', sql.NVarChar(100), action)
                .input('Details', sql.NVarChar(sql.MAX), details || '')
                .input('IPAddress', sql.NVarChar(45), req.ip)
                .input('UserAgent', sql.NVarChar(500), req.get('User-Agent') || '')
                .execute('LogUserActivity');
        } else {
            // Fallback: log to console to avoid runtime errors if no user context
            console.log(`[AUDIT] ${new Date().toISOString()} ${action} - ${details}`);
        }
    } catch (e) {
        console.error('Audit trail logging failed:', e.message);
    }
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
app.post('/api/auth/register', validate(userRegistrationSchema), async (req, res) => {
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
app.post('/api/auth/login', validate(userLoginSchema), async (req, res) => {
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

// Refresh access token
app.post('/api/auth/refresh', async (req, res) => {
    try {
        const { refreshToken } = req.body || {};
        if (!refreshToken) {
            return res.status(400).json({ success: false, error: 'refreshToken is required' });
        }

        let decoded;
        try {
            decoded = jwt.verify(refreshToken, JWT_SECRET);
        } catch (e) {
            return res.status(401).json({ success: false, error: 'Invalid refresh token' });
        }

        if (decoded.type !== 'refresh') {
            return res.status(400).json({ success: false, error: 'Invalid token type' });
        }

        const pool = await poolPromise;
        const session = await pool.request()
            .input('RefreshToken', sql.NVarChar(500), refreshToken)
            .query(`SELECT TOP 1 * FROM UserSessions WHERE RefreshToken = @RefreshToken AND IsActive = 1 AND ExpiresAt > GETUTCDATE()`);

        if (session.recordset.length === 0) {
            return res.status(401).json({ success: false, error: 'Refresh session not found or expired' });
        }

        const newTokens = generateTokens(decoded.userId);

        // Update session with new tokens and expiry
        await pool.request()
            .input('OldRefreshToken', sql.NVarChar(500), refreshToken)
            .input('NewAccessToken', sql.NVarChar(500), newTokens.accessToken)
            .input('NewRefreshToken', sql.NVarChar(500), newTokens.refreshToken)
            .input('NewExpiresAt', sql.DateTime2, new Date(Date.now() + 24 * 60 * 60 * 1000))
            .query(`UPDATE UserSessions
                    SET SessionToken = @NewAccessToken, RefreshToken = @NewRefreshToken, ExpiresAt = @NewExpiresAt
                    WHERE RefreshToken = @OldRefreshToken AND IsActive = 1`);

        res.json({ success: true, tokens: newTokens });
    } catch (error) {
        console.error('Refresh token error:', error);
        res.status(500).json({ success: false, error: 'Failed to refresh token' });
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
app.put('/api/admin/users/:id/role', authenticateToken, requirePermission('users.roles'), validate(roleUpdateSchema), async (req, res) => {
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

// Update configuration (Admin only)
app.put('/api/config/:key', authenticateToken, requirePermission('config.write'), async (req, res) => {
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
            .input('UpdatedBy', sql.NVarChar(100), (req.user && req.user.username) || req.ip || 'api')
            .execute('UpsertConfiguration');
        
        // Log the audit trail and user activity
        await logAuditTrail(req, 'UPDATE_CONFIG', `Updated ${key} = ${value}`);
        const pool2 = await poolPromise;
        await pool2.request()
            .input('UserId', sql.Int, req.user.id)
            .input('Action', sql.NVarChar(100), 'CONFIG_UPDATE')
            .input('Details', sql.NVarChar(sql.MAX), `Updated ${key}`)
            .input('IPAddress', sql.NVarChar(45), req.ip)
            .input('UserAgent', sql.NVarChar(500), req.get('User-Agent') || '')
            .execute('LogUserActivity');
        
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
const bulkConfigSchema = Joi.object({
    configs: Joi.array().items(Joi.object({
        key: Joi.string().min(1).required(),
        value: Joi.alternatives(Joi.string(), Joi.number(), Joi.boolean(), Joi.object(), Joi.array()).required(),
        category: Joi.string().min(1).default('general'),
        description: Joi.string().max(500).allow('', null),
    })).required()
});

app.put('/api/config', authenticateToken, requirePermission('config.write'), validate(bulkConfigSchema), async (req, res) => {
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
                error: 'Configuration not found'
            });
        }
        
        // Log the audit trail
        await logAuditTrail(req, 'DELETE_CONFIG', `Deleted ${result.recordset[0].Key}`);
        
        res.json({
            success: true,
            message: 'Configuration deleted successfully',
            data: result.recordset[0],
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Delete config error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete configuration',
            message: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// =============================================
// ACTIVITY LOGGING ENDPOINTS (Admin Only)
// =============================================

// Get user activity logs (Admin only)
app.get('/api/admin/logs/users', authenticateToken, requirePermission('logs.read'), async (req, res) => {
    try {
        const { userId } = req.query;

        const pool = await poolPromise;
        let query = `
            SELECT a.Id, a.Action, a.Details, a.Timestamp, a.IPAddress, a.UserAgent,
                   u.Username, u.Email, u.DisplayName
            FROM ActivityLogs a
            INNER JOIN Users u ON a.UserId = u.Id
            WHERE 1=1
        `;
        
        const request = pool.request();

        if (userId) {
            query += ` AND a.UserId = @UserId`;
            request.input('UserId', sql.Int, userId);
        }

        query += ` ORDER BY a.Timestamp DESC`;
        
        const result = await request.query(query);

        res.json({
            success: true,
            logs: result.recordset
        });

    } catch (error) {
        console.error('Get logs error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get logs'
        });
    }
});

// Get system activity logs (Admin only)
app.get('/api/admin/logs/system', authenticateToken, requirePermission('logs.read'), async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().execute('GetSystemActivityLogs');

        res.json({
            success: true,
            logs: result.recordset
        });

    } catch (error) {
        console.error('Get system logs error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get system logs'
        });
    }
});

// =============================================
// MISCELLANEOUS ENDPOINTS
// =============================================

// Test endpoint
app.get('/api/test', async (req, res) => {
    res.json({
        success: true,
        message: 'API is working',
        timestamp: new Date().toISOString()
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Not found',
        timestamp: new Date().toISOString()
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Global error handler:', err);
    
    res.status(err.statusCode || 500).json({
        success: false,
        error: err.message || 'Internal server error',
        timestamp: new Date().toISOString()
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
});

// Initialize database connection
initializeDatabase()
    .then(() => console.log('✅ Database initialized'))
    .catch(err => console.error('❌ Database initialization failed:', err.message));
