const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
require('dotenv').config();

const { initializeDatabase } = require('./db');
const healthRouter = require('./routes/health');
const authRouter = require('./routes/auth');
const adminUsersRouter = require('./routes/adminUsers');
const adminLogsRouter = require('./routes/adminLogs');
const configRouter = require('./routes/config');

const app = express();
const PORT = process.env.PORT || 3002;

// Trust Render/hosting proxy so client IPs are derived from X-Forwarded-* headers
// This must be set before any middleware that relies on req.ip (e.g., rate limiter)
app.set('trust proxy', 1);

// Security middleware
app.use(
  helmet({
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        imgSrc: ["'self'", 'data:', 'https:'],
        scriptSrc: ["'self'"],
        connectSrc: [
          "'self'",
          ...(process.env.NODE_ENV === 'production'
            ? [
                'https://fox-shrine-vtuber-website.onrender.com',
                'https://fox-shrine-vtuber-website.vercel.app',
              ]
            : [
                'http://localhost:3000',
                'http://localhost:3001',
                'http://localhost:3002',
              ]),
        ],
      },
    },
  })
);

// Compression middleware
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
    statusCode: 429,
  },
});

// CORS configuration
const defaultProdOrigins = [
  'https://foxshrinevtuber.com',
  'https://www.foxshrinevtuber.com',
  'https://fox-shrine-vtuber-website.vercel.app',
  'https://www.mei-satsuki.net',
  'https://mei-satsuki.net',
];

const envOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',').map((origin) => origin.trim()).filter(Boolean)
  : null;

const devOrigins = ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'];

let allowedOrigins = Array.from(new Set([...defaultProdOrigins, ...(envOrigins || [])]));
if (process.env.NODE_ENV !== 'production') {
  allowedOrigins = Array.from(new Set([...allowedOrigins, ...devOrigins]));
}

if (process.env.LOG_CORS === 'true') {
  console.log('[CORS] Allowed origins:', allowedOrigins);
}

const normalizeOrigin = (origin) => {
  if (!origin) return origin;
  try {
    const url = new URL(origin);
    return `${url.protocol}//${url.host}`.toLowerCase();
  } catch (error) {
    return String(origin).toLowerCase().replace(/\/$/, '');
  }
};

const normalizedAllowed = allowedOrigins.map(normalizeOrigin);

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    const isAllowed = normalizedAllowed.includes(normalizeOrigin(origin));
    return callback(null, isAllowed);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  optionsSuccessStatus: 204,
};

// Register CORS early so preflight is handled before other middleware
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Rate limiting (after CORS so preflights succeed reliably)
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.use('/api', healthRouter);
app.use('/api/auth', authRouter);
app.use('/api/admin', adminUsersRouter);
app.use('/api/admin', adminLogsRouter);
app.use('/api/config', configRouter);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Not found',
    timestamp: new Date().toISOString(),
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  res.status(err.statusCode || 500).json({
    success: false,
    error: err.message || 'Internal server error',
    timestamp: new Date().toISOString(),
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});

// Initialize database connection
initializeDatabase()
  .then(() => console.log('✅ Database initialized'))
  .catch((err) => console.error('❌ Database initialization failed:', err.message));
