# 🦊 Fox Shrine VTuber Website

A comprehensive React-based website for VTuber content creators featuring authentication, dynamic configuration management, and administrative capabilities.

## 📋 Table of Contents

- [🦊 Fox Shrine VTuber Website](#-fox-shrine-vtuber-website)
  - [📋 Table of Contents](#-table-of-contents)
  - [✨ Features](#-features)
  - [🏗️ Project Structure](#️-project-structure)
  - [⚙️ Setup \& Installation](#️-setup--installation)
    - [Prerequisites](#prerequisites)
    - [Frontend Setup](#frontend-setup)
    - [Backend API Setup](#backend-api-setup)
    - [Database Setup](#database-setup)
  - [🔧 Configuration](#-configuration)
    - [Environment Variables](#environment-variables)
    - [Site Configuration](#site-configuration)
  - [🚀 Development](#-development)
    - [Available Scripts](#available-scripts)
    - [Testing](#testing)
    - [Linting](#linting)
  - [📚 Documentation](#-documentation)
  - [🔐 Authentication System](#-authentication-system)
  - [🎨 Components](#-components)
  - [🪝 Hooks](#-hooks)
  - [🛠️ Utilities](#️-utilities)
  - [📱 Deployment](#-deployment)
  - [🤝 Contributing](#-contributing)
  - [📄 License](#-license)

## ✨ Features

- **🔐 Role-Based Authentication**: Multi-level user authentication with permissions
- **⚙️ Dynamic Configuration**: Real-time website configuration through admin dashboard
- **📱 Responsive Design**: Mobile-first design with Tailwind CSS
- **🎭 VTuber Features**: Character profiles, stream schedules, social media integration
- **🛡️ Security**: JWT tokens, password hashing, session management
- **📊 Analytics**: User activity logging and performance monitoring
- **🎨 Theming**: Customizable color schemes and branding
- **🚀 Performance**: Optimized loading, caching, and error handling

## 🏗️ Project Structure

```
fox-shrine-vtuber-website/
├── api/                          # Backend API (Node.js/Express)
├── fox-shrine-vtuber/           # React Frontend Application
│   ├── public/                  # Static assets
│   ├── src/                     # Source code
│   │   ├── components/          # React components
│   │   ├── hooks/              # Custom React hooks
│   │   ├── pages/              # Page components
│   │   ├── utils/              # Utility functions
│   │   └── config/             # Configuration files
│   ├── package.json            # Dependencies and scripts
│   └── README.md               # React app documentation
├── DATABASE_SETUP.md           # Database schema setup
├── USER_ROLES_SYSTEM.md        # Authentication system docs
└── README.md                   # This file
```

## ⚙️ Setup & Installation

### Prerequisites

- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **Azure SQL Database** or **SQL Server** (for production)
- **Git**

### Frontend Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Seken-Coding/fox-shrine-vtuber-website.git
   cd fox-shrine-vtuber-website
   ```

2. **Install frontend dependencies:**
   ```bash
   cd fox-shrine-vtuber
   npm install --legacy-peer-deps
   ```

3. **Start development server:**
   ```bash
   npm start
   ```

### Backend API Setup

1. **Navigate to API directory:**
   ```bash
   cd ../api
   npm install
   ```

2. **Configure environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your database and JWT configuration
   ```

3. **Start API server:**
   ```bash
   npm start
   ```

### Database Setup

1. **Create database:** Follow instructions in `DATABASE_SETUP.md`
2. **Run schema scripts:** Execute SQL files in your database
3. **Configure connection:** Update API environment variables

## 🔧 Configuration

### Environment Variables

**Frontend (.env):**
```env
REACT_APP_API_URL=http://localhost:3002/api
REACT_APP_ENVIRONMENT=development
```

**Backend (api/.env):**
```env
# Database Configuration
DB_SERVER=your-server.database.windows.net
DB_DATABASE=fox_shrine_db
DB_USERNAME=your-username
DB_PASSWORD=your-password

# Authentication
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=24h
REFRESH_TOKEN_EXPIRES_IN=7d

# Server Configuration
PORT=3002
NODE_ENV=development
```

### Site Configuration

The application uses a dynamic configuration system managed through:

- **Default Configuration**: Defined in `src/hooks/useConfig.js`
- **Database Storage**: Persisted configuration in database
- **Local Storage**: Offline fallback storage
- **Admin Dashboard**: Real-time configuration updates

**Configuration Categories:**
- **Site Information**: Title, description, logo, URL
- **Character Details**: VTuber persona information
- **Social Media Links**: Platform URLs and handles
- **Stream Settings**: Schedule, notifications, status
- **Theme Customization**: Colors, fonts, styling
- **Feature Toggles**: Enable/disable functionality
- **Content Management**: Text content and messaging
- **Contact Information**: Business and support emails
- **System Settings**: Maintenance mode, emergency notices

## 🚀 Development

### Available Scripts

**Frontend Scripts:**
```bash
npm start          # Start development server
npm test           # Run test suite
npm run build      # Build for production
npm run test:watch # Run tests in watch mode
npm run test:coverage # Generate coverage report
```

**Backend Scripts:**
```bash
npm start          # Start API server
npm run dev        # Start with nodemon
npm test           # Run API tests
```

### Testing

The project includes comprehensive testing:

- **Unit Tests**: Component and hook testing
- **Integration Tests**: API endpoint testing
- **Authentication Tests**: Login/logout flow testing
- **Configuration Tests**: Dynamic config testing

**Run specific test suites:**
```bash
# Frontend tests
npm test -- --testPathPattern=components
npm test -- --testPathPattern=hooks

# Backend tests
cd api && npm test
```

### Linting

```bash
# Frontend linting
npm run lint
npm run lint:fix

# Backend linting
cd api && npm run lint
```

## 📚 Documentation

- **[📚 Function Documentation](./FUNCTIONS.md)** - Complete API reference for all functions, hooks, and parameters
- **[🛠️ Setup Guide](./SETUP.md)** - Detailed installation and deployment instructions
- **[🔌 API Documentation](./API.md)** - Backend API endpoints and authentication
- **[🎨 Component Guide](./COMPONENTS.md)** - React component documentation and usage examples
- **[🔐 Authentication System](./USER_ROLES_SYSTEM.md)** - User roles, permissions, and security
- **[🗄️ Database Schema](./DATABASE_SETUP.md)** - Database structure and setup

## 🔐 Authentication System

The application implements a robust authentication system with:

**User Roles:**
- **Guest**: Read-only access to public content
- **Member**: Basic registered user privileges
- **VIP**: Enhanced member privileges
- **Moderator**: Content moderation capabilities
- **Admin**: Full administrative access
- **Super Admin**: Complete system control

**Security Features:**
- BCrypt password hashing (12 rounds)
- JWT token authentication with refresh tokens
- Session management and automatic cleanup
- Account lockout after failed attempts
- Complete activity logging
- IP tracking and monitoring

## 🎨 Components

**Core Components:**
- `AdminDashboard` - Administrative interface
- `AuthModal` - Login/registration modal
- `Navbar` - Main navigation component
- `Footer` - Site footer with links
- `ErrorBoundary` - Error handling wrapper
- `SEO` - Search engine optimization

**Feature Components:**
- `HeroSection` - Main landing section
- `StreamSchedule` - Stream timing display
- `SocialShare` - Social media integration
- `MerchShowcase` - Merchandise display
- `LatestVideos` - Video content showcase

## 🪝 Hooks

**Authentication Hooks:**
- `useAuth` - Authentication state and methods
- `usePermissions` - Permission checking utilities

**Configuration Hooks:**
- `useConfig` - Local configuration management
- `useConfigDatabase` - Database-backed configuration
- `useConfigOptimized` - Performance-optimized config

**Utility Hooks:**
- Custom hooks for API calls, local storage, and performance monitoring

## 🛠️ Utilities

**Performance Utilities:**
- `performanceMonitor.js` - Performance tracking and metrics
- `apiOptimizer.js` - API request optimization

**Helper Functions:**
- Configuration merging and validation
- Error handling and logging
- Data formatting and transformation

## 📱 Deployment

**Production Deployment:**

1. **Build the application:**
   ```bash
   cd fox-shrine-vtuber
   npm run build
   ```

2. **Deploy backend API:**
   ```bash
   cd ../api
   # Deploy to your hosting service (Heroku, Azure, AWS, etc.)
   ```

3. **Configure production environment:**
   - Update environment variables
   - Set up database connections
   - Configure CORS settings
   - Set up SSL certificates

4. **Database setup:**
   - Run production database scripts
   - Configure connection strings
   - Set up backup procedures

**Hosting Recommendations:**
- **Frontend**: Netlify, Vercel, AWS S3 + CloudFront
- **Backend**: Heroku, Azure App Service, AWS ECS
- **Database**: Azure SQL Database, AWS RDS

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Submit a pull request

**Development Guidelines:**
- Follow existing code style and conventions
- Add tests for new functionality
- Update documentation for changes
- Ensure all tests pass before submitting

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

**🦊 Made with love for the VTuber community! ✨**

For support or questions, please open an issue or contact the development team.