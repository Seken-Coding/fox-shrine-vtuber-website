# 🛠️ Fox Shrine VTuber Website - Setup Guide

Complete setup and deployment guide for the Fox Shrine VTuber website.

## 📋 Table of Contents

- [🛠️ Fox Shrine VTuber Website - Setup Guide](#️-fox-shrine-vtuber-website---setup-guide)
  - [📋 Table of Contents](#-table-of-contents)
  - [🔧 Prerequisites](#-prerequisites)
    - [System Requirements](#system-requirements)
    - [Required Software](#required-software)
    - [Required Services](#required-services)
  - [📦 Installation](#-installation)
    - [1. Clone Repository](#1-clone-repository)
    - [2. Frontend Setup](#2-frontend-setup)
    - [3. Backend API Setup](#3-backend-api-setup)
    - [4. Database Setup](#4-database-setup)
  - [⚙️ Configuration](#-configuration)
    - [Environment Variables](#environment-variables)
    - [Database Configuration](#database-configuration)
    - [Authentication Setup](#authentication-setup)
  - [🚀 Development](#-development)
    - [Starting Development Servers](#starting-development-servers)
    - [Available Scripts](#available-scripts)
    - [Development Workflow](#development-workflow)
  - [🧪 Testing](#-testing)
    - [Running Tests](#running-tests)
    - [Test Coverage](#test-coverage)
    - [Testing Guidelines](#testing-guidelines)
  - [📱 Production Deployment](#-production-deployment)
    - [Frontend Deployment](#frontend-deployment)
    - [Backend Deployment](#backend-deployment)
    - [Database Deployment](#database-deployment)
  - [🔒 Security Configuration](#-security-configuration)
    - [JWT Configuration](#jwt-configuration)
    - [CORS Setup](#cors-setup)
    - [Environment Security](#environment-security)
  - [🎨 Customization](#-customization)
    - [Theme Configuration](#theme-configuration)
    - [Content Management](#content-management)
    - [Feature Toggles](#feature-toggles)
  - [🔧 Troubleshooting](#-troubleshooting)
    - [Common Issues](#common-issues)
    - [Debug Mode](#debug-mode)
    - [Log Analysis](#log-analysis)

## 🔧 Prerequisites

### System Requirements

- **Operating System**: Windows 10+, macOS 10.15+, or Linux (Ubuntu 18.04+)
- **RAM**: Minimum 4GB, recommended 8GB+
- **Storage**: Minimum 2GB free space
- **Network**: Stable internet connection for package downloads

### Required Software

1. **Node.js** (Version 16.x or higher)
   ```bash
   # Check your Node.js version
   node --version
   
   # Download from: https://nodejs.org/
   ```

2. **npm** or **yarn** (Package manager)
   ```bash
   # npm comes with Node.js
   npm --version
   
   # Or install yarn
   npm install -g yarn
   ```

3. **Git** (Version control)
   ```bash
   # Check Git installation
   git --version
   
   # Download from: https://git-scm.com/
   ```

4. **Database Client** (Optional, for database management)
   - Azure Data Studio (Recommended)
   - SQL Server Management Studio (SSMS)
   - DBeaver (Cross-platform)

### Required Services

1. **Database Server**
   - **Production**: Azure SQL Database (Recommended)
   - **Development**: SQL Server Express LocalDB
   - **Alternative**: PostgreSQL or MySQL

2. **Hosting Services** (For production)
   - **Frontend**: Netlify, Vercel, or AWS S3 + CloudFront
   - **Backend**: Heroku, Azure App Service, or AWS ECS
   - **Database**: Azure SQL Database or AWS RDS

## 📦 Installation

### 1. Clone Repository

```bash
# Clone the repository
git clone https://github.com/Seken-Coding/fox-shrine-vtuber-website.git

# Navigate to project directory
cd fox-shrine-vtuber-website

# Check project structure
ls -la
```

### 2. Frontend Setup

```bash
# Navigate to React application directory
cd fox-shrine-vtuber

# Install dependencies (use --legacy-peer-deps for React 19)
npm install --legacy-peer-deps

# Alternative: If you encounter dependency conflicts
npm install --force

# Verify installation
npm list --depth=0
```

**Common Dependency Issues:**
```bash
# If you get peer dependency warnings
npm install --legacy-peer-deps

# Clear npm cache if needed
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

### 3. Backend API Setup

```bash
# Navigate to API directory
cd ../api

# Install backend dependencies
npm install

# Install additional security packages
npm install bcrypt jsonwebtoken cors helmet express-rate-limit

# Verify installation
npm list --depth=0
```

### 4. Database Setup

**Option A: Azure SQL Database (Production)**

1. **Create Azure SQL Database:**
   ```bash
   # Using Azure CLI (optional)
   az sql server create --name foxshrine-server --resource-group foxshrine-rg --location "East US" --admin-user foxadmin --admin-password "YourSecurePassword123!"
   
   az sql db create --resource-group foxshrine-rg --server foxshrine-server --name fox_shrine_db --service-objective Basic
   ```

2. **Run Database Scripts:**
   ```sql
   -- Connect to your Azure SQL Database
   -- Run DATABASE_SETUP.md scripts in order:
   -- 1. Create tables
   -- 2. Create stored procedures
   -- 3. Insert default data
   -- 4. Create admin user
   ```

**Option B: Local SQL Server (Development)**

1. **Install SQL Server Express:**
   ```bash
   # Windows: Download from Microsoft
   # macOS: Use Docker
   docker run -e "ACCEPT_EULA=Y" -e "SA_PASSWORD=YourPassword123!" -p 1433:1433 --name sqlserver -d mcr.microsoft.com/mssql/server:2019-latest
   
   # Linux: Install SQL Server for Linux
   ```

2. **Create Database:**
   ```sql
   CREATE DATABASE fox_shrine_db;
   USE fox_shrine_db;
   -- Run setup scripts from DATABASE_SETUP.md
   ```

## ⚙️ Configuration

### Environment Variables

**Frontend Configuration** (`fox-shrine-vtuber/.env`):
```env
# API Configuration
REACT_APP_API_URL=http://localhost:3002/api
REACT_APP_API_TIMEOUT=10000

# Environment Settings
REACT_APP_ENVIRONMENT=development
REACT_APP_VERSION=1.0.0

# Feature Flags
REACT_APP_ENABLE_ANALYTICS=false
REACT_APP_ENABLE_DEBUG_MODE=true
REACT_APP_ENABLE_MAINTENANCE_MODE=false

# Third-party Services (Optional)
REACT_APP_GOOGLE_ANALYTICS_ID=
REACT_APP_SENTRY_DSN=
```

**Backend Configuration** (`api/.env`):
```env
# Server Configuration
PORT=3002
NODE_ENV=development
API_VERSION=v1

# Database Configuration
DB_SERVER=localhost
DB_DATABASE=fox_shrine_db
DB_USERNAME=sa
DB_PASSWORD=YourPassword123!
DB_PORT=1433
DB_ENCRYPT=true
DB_TRUST_SERVER_CERTIFICATE=true

# Authentication Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-minimum-32-characters
JWT_EXPIRES_IN=24h
REFRESH_TOKEN_EXPIRES_IN=7d
BCRYPT_ROUNDS=12

# Security Configuration
CORS_ORIGIN=http://localhost:3000
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW=15

# Logging Configuration
LOG_LEVEL=info
LOG_FILE=./logs/app.log
ENABLE_REQUEST_LOGGING=true

# Performance Configuration
API_TIMEOUT=30000
MAX_REQUEST_SIZE=10mb
ENABLE_COMPRESSION=true
```

### Database Configuration

**Connection String Format:**
```javascript
// For Azure SQL Database
{
  server: 'your-server.database.windows.net',
  database: 'fox_shrine_db',
  user: 'your-username',
  password: 'your-password',
  port: 1433,
  options: {
    encrypt: true,
    trustServerCertificate: false
  }
}

// For Local SQL Server
{
  server: 'localhost',
  database: 'fox_shrine_db',
  user: 'sa',
  password: 'YourPassword123!',
  port: 1433,
  options: {
    encrypt: true,
    trustServerCertificate: true
  }
}
```

### Authentication Setup

1. **Generate JWT Secret:**
   ```bash
   # Generate a secure random string (32+ characters)
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   
   # Or use online generator: https://generate-secret-key.vercel.app/
   ```

2. **Create Default Admin User:**
   ```sql
   -- This is handled automatically by the database setup scripts
   -- Default credentials: foxadmin / FoxShrine2025!
   -- CHANGE THESE IMMEDIATELY AFTER SETUP!
   ```

3. **Configure Password Policy:**
   ```javascript
   // In your API configuration
   const passwordPolicy = {
     minLength: 8,
     requireUppercase: true,
     requireLowercase: true,
     requireNumbers: true,
     requireSpecialChars: false,
     maxLoginAttempts: 5,
     lockoutDuration: 30 * 60 * 1000 // 30 minutes
   };
   ```

## 🚀 Development

### Starting Development Servers

**Terminal 1 - Frontend:**
```bash
cd fox-shrine-vtuber
npm start

# Server will start on http://localhost:3000
# Hot reload enabled for development
```

**Terminal 2 - Backend API:**
```bash
cd api
npm start

# API server will start on http://localhost:3002
# Access API documentation at http://localhost:3002/api-docs
```

**Terminal 3 - Database (if using Docker):**
```bash
# Start SQL Server container
docker start sqlserver

# Or start fresh container
docker run -e "ACCEPT_EULA=Y" -e "SA_PASSWORD=YourPassword123!" -p 1433:1433 --name sqlserver -d mcr.microsoft.com/mssql/server:2019-latest
```

### Available Scripts

**Frontend Scripts:**
```bash
# Development
npm start                 # Start development server
npm run start:dev         # Start with development settings

# Testing
npm test                  # Run test suite
npm run test:watch        # Run tests in watch mode
npm run test:coverage     # Generate coverage report
npm run test:debug        # Run tests with debugger

# Building
npm run build             # Build for production
npm run build:dev         # Build for development
npm run build:analyze     # Analyze bundle size

# Linting & Formatting
npm run lint              # Run ESLint
npm run lint:fix          # Fix ESLint issues
npm run format            # Format code with Prettier
```

**Backend Scripts:**
```bash
# Development
npm start                 # Start API server
npm run dev               # Start with nodemon (auto-restart)
npm run dev:debug         # Start with debugging enabled

# Testing
npm test                  # Run API tests
npm run test:integration  # Run integration tests
npm run test:coverage     # Generate test coverage

# Database
npm run db:migrate        # Run database migrations
npm run db:seed           # Seed database with test data
npm run db:reset          # Reset database to clean state

# Production
npm run build             # Build for production
npm run start:prod        # Start production server
```

### Development Workflow

1. **Start Development Environment:**
   ```bash
   # Terminal 1: Start database (if using Docker)
   docker start sqlserver
   
   # Terminal 2: Start API server
   cd api && npm run dev
   
   # Terminal 3: Start React app
   cd fox-shrine-vtuber && npm start
   ```

2. **Development Process:**
   - Make changes to React components or API endpoints
   - Changes automatically reload in browser
   - Run tests frequently: `npm test`
   - Check linting: `npm run lint`
   - Commit changes with descriptive messages

3. **Testing Changes:**
   ```bash
   # Test frontend components
   cd fox-shrine-vtuber && npm test
   
   # Test API endpoints
   cd api && npm test
   
   # Manual testing
   # Open http://localhost:3000 in browser
   # Test authentication, configuration, etc.
   ```

## 🧪 Testing

### Running Tests

**Frontend Tests:**
```bash
cd fox-shrine-vtuber

# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- AuthModal.test.js

# Run tests matching pattern
npm test -- --testNamePattern="login"
```

**Backend Tests:**
```bash
cd api

# Run all API tests
npm test

# Run specific test suite
npm test -- --grep "Authentication"

# Run with coverage
npm run test:coverage
```

### Test Coverage

**Coverage Targets:**
- **Statements**: > 80%
- **Branches**: > 75%
- **Functions**: > 85%
- **Lines**: > 80%

**View Coverage Reports:**
```bash
# Frontend coverage
cd fox-shrine-vtuber && npm run test:coverage
open coverage/lcov-report/index.html

# Backend coverage
cd api && npm run test:coverage
open coverage/lcov-report/index.html
```

### Testing Guidelines

1. **Component Testing:**
   - Test user interactions
   - Test error states
   - Test loading states
   - Mock external dependencies

2. **Hook Testing:**
   - Test state changes
   - Test side effects
   - Test error handling
   - Test cleanup functions

3. **API Testing:**
   - Test all endpoints
   - Test authentication
   - Test error responses
   - Test data validation

## 📱 Production Deployment

### Frontend Deployment

**Option 1: Netlify (Recommended)**

1. **Build Application:**
   ```bash
   cd fox-shrine-vtuber
   npm run build
   ```

2. **Deploy to Netlify:**
   ```bash
   # Install Netlify CLI
   npm install -g netlify-cli
   
   # Login to Netlify
   netlify login
   
   # Deploy site
   netlify deploy --prod --dir=build
   ```

3. **Configure Environment Variables:**
   ```bash
   # In Netlify dashboard, set:
   REACT_APP_API_URL=https://your-api-domain.com/api
   REACT_APP_ENVIRONMENT=production
   ```

**Option 2: Vercel**

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
cd fox-shrine-vtuber
vercel --prod
```

### Backend Deployment

**Option 1: Heroku**

1. **Prepare for Deployment:**
   ```bash
   cd api
   
   # Create Procfile
   echo "web: node server.js" > Procfile
   
   # Update package.json scripts
   "scripts": {
     "start": "node server.js",
     "heroku-postbuild": "npm run build"
   }
   ```

2. **Deploy to Heroku:**
   ```bash
   # Install Heroku CLI
   # Login to Heroku
   heroku login
   
   # Create Heroku app
   heroku create foxshrine-api
   
   # Set environment variables
   heroku config:set NODE_ENV=production
   heroku config:set JWT_SECRET=your-production-jwt-secret
   heroku config:set DB_SERVER=your-azure-sql-server.database.windows.net
   # ... set all environment variables
   
   # Deploy
   git push heroku main
   ```

**Option 2: Azure App Service**

```bash
# Install Azure CLI
# Login to Azure
az login

# Create resource group
az group create --name foxshrine-rg --location "East US"

# Create App Service plan
az appservice plan create --name foxshrine-plan --resource-group foxshrine-rg --sku B1

# Create web app
az webapp create --resource-group foxshrine-rg --plan foxshrine-plan --name foxshrine-api --runtime "NODE|16-lts"

# Deploy code
zip -r api.zip . -x "node_modules/*" ".git/*"
az webapp deployment source config-zip --resource-group foxshrine-rg --name foxshrine-api --src api.zip
```

### Database Deployment

**Azure SQL Database Setup:**

1. **Create Database:**
   ```bash
   # Create SQL Server
   az sql server create --name foxshrine-server --resource-group foxshrine-rg --location "East US" --admin-user foxadmin --admin-password "YourSecurePassword123!"
   
   # Create database
   az sql db create --resource-group foxshrine-rg --server foxshrine-server --name fox_shrine_db --service-objective S0
   
   # Configure firewall
   az sql server firewall-rule create --resource-group foxshrine-rg --server foxshrine-server --name AllowAzureServices --start-ip-address 0.0.0.0 --end-ip-address 0.0.0.0
   ```

2. **Run Database Scripts:**
   ```bash
   # Connect using Azure Data Studio or SSMS
   # Server: foxshrine-server.database.windows.net
   # Database: fox_shrine_db
   # Authentication: SQL Server Authentication
   
   # Run scripts from DATABASE_SETUP.md in order
   ```

## 🔒 Security Configuration

### JWT Configuration

**Production JWT Settings:**
```env
# Use a strong, random secret (minimum 32 characters)
JWT_SECRET=your-super-secure-random-string-minimum-32-characters-long

# Reasonable token expiration times
JWT_EXPIRES_IN=24h
REFRESH_TOKEN_EXPIRES_IN=7d

# Strong password hashing
BCRYPT_ROUNDS=12
```

### CORS Setup

**Production CORS Configuration:**
```javascript
// In your API server
const corsOptions = {
  origin: [
    'https://your-frontend-domain.com',
    'https://www.your-frontend-domain.com'
  ],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
```

### Environment Security

1. **Secure Environment Variables:**
   - Never commit `.env` files to version control
   - Use strong passwords and secrets
   - Rotate secrets regularly
   - Use different secrets for each environment

2. **Database Security:**
   - Enable SQL Server authentication
   - Use strong database passwords
   - Enable SSL/TLS encryption
   - Configure firewall rules
   - Regular security updates

3. **API Security:**
   - Enable HTTPS in production
   - Use security headers (helmet.js)
   - Implement rate limiting
   - Validate all input data
   - Log security events

## 🎨 Customization

### Theme Configuration

**Custom Color Scheme:**
```javascript
// Update in configuration or admin dashboard
const customTheme = {
  primaryColor: '#C41E3A',      // Your brand primary color
  secondaryColor: '#FF9500',    // Secondary accent color
  accentColor: '#5FB4A2',       // Tertiary accent
  backgroundColor: '#F5F1E8',   // Background color
  textColor: '#2D3748',         // Primary text color
  fontFamily: 'Cinzel, serif'   // Primary font
};
```

**Custom Fonts:**
```css
/* Add to index.css or import in components */
@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Inter:wght@300;400;500;600&display=swap');

/* Or self-host fonts for better performance */
@font-face {
  font-family: 'Cinzel';
  src: url('./fonts/cinzel-regular.woff2') format('woff2');
  font-weight: 400;
  font-display: swap;
}
```

### Content Management

**Update Site Content:**
```javascript
// Through admin dashboard or configuration
const contentUpdates = {
  'content.heroTitle': 'Your Custom Hero Title',
  'content.heroSubtitle': 'Your custom subtitle text',
  'content.aboutText': 'Your VTuber character story...',
  'character.name': 'Your VTuber Name',
  'character.greeting': 'Your custom greeting! 🎋'
};

// Apply updates
updateMultipleConfig(contentUpdates);
```

### Feature Toggles

**Enable/Disable Features:**
```javascript
// Configure which features to show
const featureConfig = {
  'features.showMerch': true,           // Merchandise section
  'features.showDonations': true,       // Donation/support options
  'features.showSchedule': true,        // Stream schedule
  'features.showLatestVideos': true,    // Latest videos section
  'features.enableNotifications': false // Browser notifications
};
```

## 🔧 Troubleshooting

### Common Issues

1. **Dependency Installation Issues:**
   ```bash
   # Clear npm cache
   npm cache clean --force
   
   # Delete node_modules and reinstall
   rm -rf node_modules package-lock.json
   npm install --legacy-peer-deps
   
   # Use different Node.js version with nvm
   nvm install 16
   nvm use 16
   ```

2. **Database Connection Issues:**
   ```bash
   # Test database connection
   telnet your-server.database.windows.net 1433
   
   # Check firewall rules
   # Verify connection string
   # Check authentication credentials
   ```

3. **CORS Issues:**
   ```javascript
   // Add to API server temporarily for debugging
   app.use(cors({
     origin: '*',  // NEVER use in production
     credentials: true
   }));
   ```

4. **Build Issues:**
   ```bash
   # Clear build cache
   rm -rf build
   npm run build
   
   # Check for TypeScript errors
   npx tsc --noEmit
   
   # Check for linting errors
   npm run lint
   ```

### Debug Mode

**Enable Debug Logging:**
```env
# Frontend debugging
REACT_APP_ENABLE_DEBUG_MODE=true
REACT_APP_LOG_LEVEL=debug

# Backend debugging
NODE_ENV=development
LOG_LEVEL=debug
ENABLE_REQUEST_LOGGING=true
```

**Debug API Calls:**
```javascript
// In browser console
localStorage.setItem('debug', 'foxshrine:*');

// View network requests in DevTools
// Check authentication tokens
// Monitor WebSocket connections
```

### Log Analysis

**Frontend Logs:**
- Browser Developer Tools Console
- Network tab for API calls
- React DevTools for component state

**Backend Logs:**
```bash
# View application logs
tail -f logs/app.log

# View error logs
tail -f logs/error.log

# Docker logs (if using Docker)
docker logs sqlserver
```

**Database Logs:**
- Azure SQL Database Query Performance Insight
- SQL Server error logs
- Connection logs

---

**🦊 Setup Complete!**

Your Fox Shrine VTuber website should now be running successfully. For additional support:

1. Check the [troubleshooting section](#-troubleshooting)
2. Review the [function documentation](./FUNCTIONS.md)
3. Open an issue in the GitHub repository
4. Contact the development team

**Next Steps:**
1. Change default admin password
2. Customize your VTuber character and branding
3. Configure social media links
4. Set up your streaming schedule
5. Test all functionality thoroughly
6. Deploy to production when ready

Happy streaming! 🎬✨