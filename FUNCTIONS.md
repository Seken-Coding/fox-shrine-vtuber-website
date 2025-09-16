# 📚 Function Documentation

Complete reference for all functions, hooks, and components in the Fox Shrine VTuber Website.

## 📋 Table of Contents

- [📚 Function Documentation](#-function-documentation)
  - [📋 Table of Contents](#-table-of-contents)
  - [🪝 React Hooks](#-react-hooks)
    - [useAuth Hook](#useauth-hook)
    - [useConfig Hook](#useconfig-hook)
    - [useConfigDatabase Hook](#useconfigdatabase-hook)
    - [useConfigOptimized Hook](#useconfigoptimized-hook)
  - [🎨 React Components](#-react-components)
    - [App Component](#app-component)
    - [AdminDashboard Component](#admindashboard-component)
    - [AuthModal Component](#authmodal-component)
    - [PermissionGate Component](#permissiongate-component)
  - [🛠️ Utility Functions](#️-utility-functions)
    - [Configuration Utilities](#configuration-utilities)
    - [Authentication Utilities](#authentication-utilities)
    - [Performance Utilities](#performance-utilities)
  - [⚙️ Setup Parameters](#️-setup-parameters)
    - [Environment Configuration](#environment-configuration)
    - [Database Configuration](#database-configuration)
    - [Authentication Configuration](#authentication-configuration)
    - [Theme Configuration](#theme-configuration)

## 🪝 React Hooks

### useAuth Hook

**File:** `src/hooks/useAuth.js`

**Purpose:** Manages user authentication state, login/logout functionality, and permission checking.

#### Functions:

##### `login(username, password)`
Authenticates a user with username and password.

**Parameters:**
- `username` (string): User's login username
- `password` (string): User's password

**Returns:**
- `Promise<{success: boolean, user?: object, error?: string}>`

**Example:**
```javascript
const { login } = useAuth();

const handleLogin = async () => {
  const result = await login('admin', 'password123');
  if (result.success) {
    console.log('Login successful:', result.user);
  } else {
    console.error('Login failed:', result.error);
  }
};
```

##### `register(userData)`
Registers a new user account.

**Parameters:**
- `userData` (object): User registration data
  - `username` (string): Desired username
  - `email` (string): User's email address
  - `password` (string): User's password
  - `displayName` (string): Display name for the user

**Returns:**
- `Promise<{success: boolean, user?: object, error?: string}>`

**Example:**
```javascript
const { register } = useAuth();

const handleRegister = async () => {
  const result = await register({
    username: 'newuser',
    email: 'user@example.com',
    password: 'securepassword',
    displayName: 'New User'
  });
  
  if (result.success) {
    console.log('Registration successful:', result.user);
  }
};
```

##### `logout()`
Logs out the current user and clears authentication state.

**Returns:**
- `Promise<void>`

**Example:**
```javascript
const { logout } = useAuth();

const handleLogout = async () => {
  await logout();
  console.log('User logged out');
};
```

##### `hasPermission(permission)`
Checks if the current user has a specific permission.

**Parameters:**
- `permission` (string): Permission to check (e.g., 'config.write', 'users.read')

**Returns:**
- `boolean`: True if user has permission, false otherwise

**Example:**
```javascript
const { hasPermission } = useAuth();

if (hasPermission('config.write')) {
  // Show configuration editing interface
}
```

##### `hasRole(role)`
Checks if the current user has a specific role.

**Parameters:**
- `role` (string): Role to check ('Guest', 'Member', 'Admin', etc.)

**Returns:**
- `boolean`: True if user has role, false otherwise

##### `isAdmin()`
Checks if the current user is an administrator.

**Returns:**
- `boolean`: True if user is Admin or Super Admin

##### `isAuthenticated()`
Checks if a user is currently authenticated.

**Returns:**
- `boolean`: True if user is logged in

##### `apiCall(endpoint, options)`
Makes authenticated API calls with automatic token handling.

**Parameters:**
- `endpoint` (string): API endpoint path
- `options` (object): Fetch options (method, headers, body, etc.)

**Returns:**
- `Promise<Response>`: Fetch response object

**Example:**
```javascript
const { apiCall } = useAuth();

const response = await apiCall('/admin/users', {
  method: 'GET'
});
const users = await response.json();
```

#### State Properties:

- `user` (object|null): Current authenticated user object
- `loading` (boolean): Authentication loading state
- `error` (string|null): Current authentication error message

### useConfig Hook

**File:** `src/hooks/useConfig.js`

**Purpose:** Manages local configuration with localStorage fallback.

#### Functions:

##### `updateConfig(key, value)`
Updates a configuration value using dot notation.

**Parameters:**
- `key` (string): Configuration key with dot notation (e.g., 'theme.primaryColor')
- `value` (any): New value to set

**Returns:**
- `boolean`: True if update was successful

**Example:**
```javascript
const { updateConfig } = useConfig();

updateConfig('theme.primaryColor', '#FF0000');
updateConfig('social.twitchUrl', 'https://twitch.tv/newchannel');
```

##### `updateMultipleConfig(updates)`
Updates multiple configuration values at once.

**Parameters:**
- `updates` (array): Array of update objects
  - `key` (string): Configuration key
  - `value` (any): New value

**Returns:**
- `boolean`: True if all updates were successful

**Example:**
```javascript
const { updateMultipleConfig } = useConfig();

updateMultipleConfig([
  { key: 'siteTitle', value: 'New Site Title' },
  { key: 'theme.primaryColor', value: '#00FF00' },
  { key: 'features.showMerch', value: false }
]);
```

##### `resetConfig()`
Resets configuration to default values.

**Returns:**
- `boolean`: True if reset was successful

#### State Properties:

- `config` (object): Current configuration object
- `error` (string|null): Configuration error message
- `isOnline` (boolean): Always true for localStorage version
- `lastSync` (Date): Last configuration sync time

### useConfigDatabase Hook

**File:** `src/hooks/useConfigDatabase.js`

**Purpose:** Manages configuration with database persistence and real-time updates.

#### Functions:

##### `updateConfig(key, value, category)`
Updates configuration in database with optimistic updates.

**Parameters:**
- `key` (string): Configuration key with dot notation
- `value` (any): New value to set
- `category` (string, optional): Configuration category (default: 'general')

**Returns:**
- `Promise<object>`: Updated configuration data

**Example:**
```javascript
const { updateConfig } = useConfigDatabase();

try {
  await updateConfig('stream.title', 'New Stream Title', 'streaming');
  console.log('Configuration updated successfully');
} catch (error) {
  console.error('Update failed:', error);
}
```

##### `refreshConfig()`
Manually refreshes configuration from database.

**Returns:**
- `Promise<object>`: Latest configuration data

**Example:**
```javascript
const { refreshConfig } = useConfigDatabase();

const latestConfig = await refreshConfig();
```

#### State Properties:

- `config` (object): Current configuration object
- `loading` (boolean): Configuration loading state
- `error` (string|null): Configuration error message
- `lastSync` (Date|null): Last successful sync with database
- `isOnline` (boolean): Network connectivity status

#### Configuration Structure:

The configuration object contains the following sections:

```javascript
{
  // Site Information
  siteTitle: string,
  siteDescription: string,
  siteLogo: string,
  siteUrl: string,
  
  // Character Information
  character: {
    name: string,
    description: string,
    image: string,
    greeting: string
  },
  
  // Social Media Links
  social: {
    twitchUrl: string,
    youtubeUrl: string,
    twitterUrl: string,
    discordUrl: string,
    instagramUrl: string
  },
  
  // Stream Settings
  stream: {
    title: string,
    category: string,
    isLive: boolean,
    nextStreamDate: string,
    notification: string
  },
  
  // Theme Settings
  theme: {
    primaryColor: string,
    secondaryColor: string,
    accentColor: string,
    backgroundColor: string,
    fontFamily: string
  },
  
  // Feature Toggles
  features: {
    showMerch: boolean,
    showDonations: boolean,
    showSchedule: boolean,
    showLatestVideos: boolean,
    enableNotifications: boolean
  },
  
  // Content Management
  content: {
    heroTitle: string,
    heroSubtitle: string,
    aboutText: string
  },
  
  // Contact Information
  contact: {
    businessEmail: string,
    fanEmail: string,
    supportEmail: string
  },
  
  // System Settings
  system: {
    maintenanceMode: boolean,
    maintenanceMessage: string,
    emergencyNotice: string
  }
}
```

### useConfigOptimized Hook

**File:** `src/hooks/useConfigOptimized.js`

**Purpose:** Performance-optimized configuration management with caching and memoization.

*Note: This file is currently empty and needs implementation.*

**Planned Features:**
- Memoized configuration selectors
- Debounced updates
- Cache invalidation strategies
- Performance monitoring

## 🎨 React Components

### App Component

**File:** `src/App.js`

**Purpose:** Main application component with routing and provider setup.

#### Features:
- React Router configuration
- Authentication provider setup
- Configuration provider setup
- Helmet provider for SEO
- Global navigation and footer

#### Route Structure:
- `/` - HomePage
- `/about` - AboutPage
- `/login` - LoginPage
- `/admin` - AdminDashboard (protected)
- `/setup` - SetupPage (development only)

### AdminDashboard Component

**File:** `src/components/AdminDashboard.jsx`

**Purpose:** Administrative interface for managing users and configuration.

#### Features:
- User management interface
- Role assignment capabilities
- Configuration editing
- Permission-based access control
- Real-time updates

#### Required Permissions:
- View: `users.read` or `config.read`
- User Management: `users.write`, `users.roles`
- Configuration Management: `config.write`

### AuthModal Component

**File:** `src/components/AuthModal.jsx`

**Purpose:** Unified login and registration modal interface.

#### Props:
- `isOpen` (boolean): Modal visibility state
- `onClose` (function): Close modal callback
- `initialMode` (string): 'login' or 'register'

#### Features:
- Form validation
- Loading states
- Error handling
- Mode switching (login/register)
- Guest-friendly messaging

**Example:**
```javascript
<AuthModal 
  isOpen={showModal}
  onClose={() => setShowModal(false)}
  initialMode="login"
/>
```

### PermissionGate Component

**File:** `src/hooks/useAuth.js`

**Purpose:** Conditional rendering based on user permissions.

#### Props:
- `permission` (string): Required permission
- `children` (ReactNode): Content to render if permission granted
- `showMessage` (boolean): Show "no permission" message if access denied

**Example:**
```javascript
<PermissionGate permission="config.write">
  <ConfigurationPanel />
</PermissionGate>

<PermissionGate permission="users.read" showMessage>
  <UsersList />
</PermissionGate>
```

## 🛠️ Utility Functions

### Configuration Utilities

#### `getDefaultConfig()`
**File:** `src/hooks/useConfig.js`

Returns the default configuration object with fallback values.

**Returns:**
- `object`: Default configuration structure

#### `mergeDeep(target, source)`
**File:** `src/hooks/useConfigDatabase.js`

Deep merges two configuration objects, preserving nested structures.

**Parameters:**
- `target` (object): Target configuration object
- `source` (object): Source configuration to merge

**Returns:**
- `object`: Merged configuration object

#### `isObject(item)`
**File:** `src/hooks/useConfigDatabase.js`

Checks if a value is a plain object (not array or null).

**Parameters:**
- `item` (any): Value to check

**Returns:**
- `boolean`: True if item is a plain object

### Authentication Utilities

#### `getStoredToken()`
**File:** `src/hooks/useAuth.js`

Retrieves JWT token from localStorage.

**Returns:**
- `string|null`: JWT token or null if not found

#### `storeTokens(tokens)`
**File:** `src/hooks/useAuth.js`

Stores authentication tokens in localStorage.

**Parameters:**
- `tokens` (object): Token object
  - `accessToken` (string): JWT access token
  - `refreshToken` (string): JWT refresh token

#### `clearTokens()`
**File:** `src/hooks/useAuth.js`

Removes authentication tokens from localStorage.

### Performance Utilities

**File:** `src/utils/performanceMonitor.js`

*Note: This file is currently empty and needs implementation.*

**Planned Functions:**
- `measurePerformance(name, fn)`: Measure function execution time
- `trackUserInteraction(event)`: Track user interactions
- `reportWebVitals(metric)`: Report Core Web Vitals
- `monitorAPIResponse(endpoint, response)`: Monitor API performance

**File:** `src/utils/apiOptimizer.js`

*Note: This file is currently empty and needs implementation.*

**Planned Functions:**
- `cacheRequest(url, data)`: Cache API responses
- `debounceRequest(fn, delay)`: Debounce API calls
- `batchRequests(requests)`: Batch multiple API requests
- `retryRequest(fn, maxRetries)`: Retry failed requests

## ⚙️ Setup Parameters

### Environment Configuration

#### Frontend Environment Variables

**File:** `fox-shrine-vtuber/.env`

```env
# API Configuration
REACT_APP_API_URL=http://localhost:3002/api
REACT_APP_API_TIMEOUT=10000

# Environment
REACT_APP_ENVIRONMENT=development
REACT_APP_VERSION=1.0.0

# Feature Flags
REACT_APP_ENABLE_ANALYTICS=false
REACT_APP_ENABLE_DEBUG_MODE=true

# Third-party Services
REACT_APP_GOOGLE_ANALYTICS_ID=GA-XXXXXXXXX
REACT_APP_SENTRY_DSN=https://...
```

#### Backend Environment Variables

**File:** `api/.env`

```env
# Server Configuration
PORT=3002
NODE_ENV=development
API_VERSION=v1

# Database Configuration
DB_SERVER=localhost
DB_DATABASE=fox_shrine_db
DB_USERNAME=sa
DB_PASSWORD=YourPassword123
DB_PORT=1433
DB_ENCRYPT=true
DB_TRUST_SERVER_CERTIFICATE=true

# Authentication Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
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

#### Connection Parameters

- **Server**: Azure SQL Database endpoint or local SQL Server
- **Database**: `fox_shrine_db`
- **Authentication**: SQL Server authentication
- **Encryption**: TLS encryption enabled
- **Connection Pool**: Managed by database driver

#### Schema Requirements

**Required Tables:**
- `Users` - User account information
- `Roles` - User role definitions
- `Permissions` - Permission definitions
- `RolePermissions` - Role-permission mappings
- `UserSessions` - Active user sessions
- `UserActivityLog` - User activity audit log
- `Configuration` - Site configuration storage

### Authentication Configuration

#### JWT Configuration

- **Algorithm**: HS256
- **Access Token Expiry**: 24 hours
- **Refresh Token Expiry**: 7 days
- **Secret Key**: Must be at least 32 characters
- **Issuer**: Application name
- **Audience**: Client application

#### Password Requirements

- **Minimum Length**: 8 characters
- **Hashing Algorithm**: BCrypt
- **Salt Rounds**: 12
- **Account Lockout**: 5 failed attempts
- **Lockout Duration**: 30 minutes

#### Session Management

- **Storage**: Database-backed sessions
- **Cleanup**: Automatic expired session removal
- **Tracking**: IP address and user agent logging
- **Concurrent Sessions**: Unlimited per user

### Theme Configuration

#### Color Scheme

```javascript
{
  primaryColor: '#C41E3A',      // Shrine red
  secondaryColor: '#FF9500',    // Fox orange
  accentColor: '#5FB4A2',       // Teal accent
  backgroundColor: '#F5F1E8',   // Warm cream
  textColor: '#2D3748',         // Dark gray
  linkColor: '#3182CE',         // Blue
  successColor: '#38A169',      // Green
  errorColor: '#E53E3E',        // Red
  warningColor: '#D69E2E'       // Yellow
}
```

#### Typography

```javascript
{
  fontFamily: 'Cinzel, serif',          // Elegant serif for headers
  bodyFontFamily: 'Inter, sans-serif',  // Clean sans-serif for body
  monoFontFamily: 'Fira Code, monospace', // Monospace for code
  
  fontSizes: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem',  // 36px
    '5xl': '3rem',     // 48px
    '6xl': '4rem'      // 64px
  }
}
```

#### Responsive Breakpoints

```javascript
{
  sm: '640px',   // Small devices
  md: '768px',   // Medium devices
  lg: '1024px',  // Large devices
  xl: '1280px',  // Extra large devices
  '2xl': '1536px' // 2X large devices
}
```

---

**📝 Note:** This documentation is a living document and should be updated as new functions and features are added to the application. For questions or clarifications, please refer to the inline code comments or open an issue in the repository.