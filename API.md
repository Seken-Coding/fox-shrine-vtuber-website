# 🔌 API Documentation

Complete reference for all API endpoints and backend functionality in the Fox Shrine VTuber Website.

## 📋 Table of Contents

- [🔌 API Documentation](#-api-documentation)
  - [📋 Table of Contents](#-table-of-contents)
  - [🌐 API Overview](#-api-overview)
    - [Base URL](#base-url)
    - [Authentication](#authentication)
    - [Response Format](#response-format)
    - [Error Handling](#error-handling)
  - [🔐 Authentication Endpoints](#-authentication-endpoints)
    - [POST /auth/login](#post-authlogin)
    - [POST /auth/register](#post-authregister)
    - [GET /auth/profile](#get-authprofile)
    - [POST /auth/logout](#post-authlogout)
    - [POST /auth/refresh](#post-authrefresh)
  - [⚙️ Configuration Endpoints](#️-configuration-endpoints)
    - [GET /config](#get-config)
    - [PUT /config](#put-config)
    - [PUT /config/:key](#put-configkey)
    - [DELETE /config/:key](#delete-configkey)
  - [👥 User Management Endpoints](#-user-management-endpoints)
    - [GET /admin/users](#get-adminusers)
    - [PUT /admin/users/:id/role](#put-adminusersidstaterole)
    - [GET /admin/roles](#get-adminroles)
    - [GET /admin/users/:id/activity](#get-adminusersidactivity)
  - [📊 Analytics Endpoints](#-analytics-endpoints)
    - [GET /analytics/overview](#get-analyticsoverview)
    - [GET /analytics/users](#get-analyticsusers)
    - [GET /analytics/performance](#get-analyticsperformance)
  - [🔒 Security Features](#-security-features)
    - [Rate Limiting](#rate-limiting)
    - [Input Validation](#input-validation)
    - [Permissions System](#permissions-system)
  - [📝 Data Models](#-data-models)
    - [User Model](#user-model)
    - [Configuration Model](#configuration-model)
    - [Session Model](#session-model)
    - [Activity Log Model](#activity-log-model)
  - [🚨 Error Codes](#-error-codes)
    - [HTTP Status Codes](#http-status-codes)
    - [Application Error Codes](#application-error-codes)
  - [🧪 Testing](#-testing)
    - [API Testing](#api-testing)
    - [Authentication Testing](#authentication-testing)
  - [📋 Examples](#-examples)
    - [Authentication Flow](#authentication-flow)
    - [Configuration Management](#configuration-management)
    - [User Management](#user-management)

## 🌐 API Overview

### Base URL

```
Development: http://localhost:3002/api
Production:  https://fox-shrine-vtuber-website.onrender.com/api
```

### Authentication

The API uses JWT (JSON Web Token) authentication with Bearer tokens.

**Authentication Header:**
```http
Authorization: Bearer <your-jwt-token>
```

**Token Management:**
- **Access Token**: Valid for 24 hours
- **Refresh Token**: Valid for 7 days
- **Automatic Refresh**: Handled by frontend hooks

### Response Format

All API responses follow a consistent format:

**Success Response:**
```json
{
  "success": true,
  "data": {
    // Response data
  },
  "message": "Operation completed successfully",
  "timestamp": "2025-01-15T10:30:00Z"
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Error message description",
  "code": "ERROR_CODE",
  "details": {
    // Additional error details
  },
  "timestamp": "2025-01-15T10:30:00Z"
}
```

### Error Handling

**Standard HTTP Status Codes:**
- `200` - OK
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `422` - Unprocessable Entity
- `429` - Too Many Requests
- `500` - Internal Server Error

## 🔐 Authentication Endpoints

### POST /auth/login

Authenticates a user with username and password.

**Request:**
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "securepassword"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "username": "admin",
      "email": "admin@foxshrine.com",
      "displayName": "Fox Admin",
      "role": "Admin",
      "permissions": [
        "config.read",
        "config.write",
        "users.read",
        "users.write"
      ],
      "lastLogin": "2025-01-15T10:30:00Z",
      "createdAt": "2025-01-01T00:00:00Z"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "expiresIn": 86400
    }
  }
}
```

**Error Responses:**
```json
// Invalid credentials
{
  "success": false,
  "error": "Invalid username or password",
  "code": "INVALID_CREDENTIALS"
}

// Account locked
{
  "success": false,
  "error": "Account locked due to too many failed attempts",
  "code": "ACCOUNT_LOCKED",
  "details": {
    "lockoutUntil": "2025-01-15T11:00:00Z",
    "remainingTime": 1800
  }
}
```

### POST /auth/register

Registers a new user account.

**Request:**
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "newuser",
  "email": "user@example.com",
  "password": "securepassword",
  "displayName": "New User"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 2,
      "username": "newuser",
      "email": "user@example.com",
      "displayName": "New User",
      "role": "Member",
      "permissions": [
        "content.read"
      ],
      "createdAt": "2025-01-15T10:30:00Z"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
}
```

### GET /auth/profile

Retrieves the current user's profile information.

**Request:**
```http
GET /api/auth/profile
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "username": "admin",
      "email": "admin@foxshrine.com",
      "displayName": "Fox Admin",
      "role": "Admin",
      "permissions": ["config.read", "config.write", "users.read"],
      "lastLogin": "2025-01-15T10:30:00Z",
      "loginCount": 42,
      "createdAt": "2025-01-01T00:00:00Z"
    }
  }
}
```

### POST /auth/logout

Logs out the current user and invalidates the session.

**Request:**
```http
POST /api/auth/logout
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Successfully logged out"
}
```

### POST /auth/refresh

Refreshes an expired access token using a refresh token.

**Request:**
```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "expiresIn": 86400
    }
  }
}
```

## ⚙️ Configuration Endpoints

### GET /config

Retrieves the current site configuration.

**Request:**
```http
GET /api/config
```

**Response:**
```json
{
  "success": true,
  "data": {
    "siteTitle": "Fox Shrine VTuber",
    "siteDescription": "Join the Fox Shrine for games, laughs, and shrine fox adventures!",
    "character": {
      "name": "Fox Shrine Guardian",
      "description": "A mischievous fox spirit...",
      "image": "/images/fox-character.png",
      "greeting": "Welcome to my shrine, fellow foxes! 🦊"
    },
    "social": {
      "twitchUrl": "https://twitch.tv/foxshrinevtuber",
      "youtubeUrl": "https://youtube.com/@foxshrinevtuber",
      "twitterUrl": "https://twitter.com/foxshrinevtuber"
    },
    "theme": {
      "primaryColor": "#C41E3A",
      "secondaryColor": "#FF9500",
      "accentColor": "#5FB4A2"
    },
    "features": {
      "showMerch": true,
      "showDonations": true,
      "showSchedule": true
    }
  },
  "lastUpdated": "2025-01-15T10:30:00Z",
  "version": "1.0.0"
}
```

### PUT /config

Updates multiple configuration values at once.

**Request:**
```http
PUT /api/config
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "siteTitle": "Updated Fox Shrine",
  "theme": {
    "primaryColor": "#FF0000",
    "secondaryColor": "#00FF00"
  },
  "features": {
    "showMerch": false
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "updated": [
      "siteTitle",
      "theme.primaryColor",
      "theme.secondaryColor",
      "features.showMerch"
    ],
    "configuration": {
      // Updated configuration object
    }
  },
  "message": "Configuration updated successfully"
}
```

### PUT /config/:key

Updates a single configuration value.

**Request:**
```http
PUT /api/config/theme.primaryColor
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "value": "#FF0000",
  "category": "theme"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "key": "theme.primaryColor",
    "oldValue": "#C41E3A",
    "newValue": "#FF0000",
    "updatedAt": "2025-01-15T10:30:00Z"
  }
}
```

### DELETE /config/:key

Resets a configuration value to its default.

**Request:**
```http
DELETE /api/config/theme.primaryColor
Authorization: Bearer <admin-token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "key": "theme.primaryColor",
    "resetToDefault": "#C41E3A"
  }
}
```

## 👥 User Management Endpoints

### GET /admin/users

Retrieves a list of all users with pagination.

**Request:**
```http
GET /api/admin/users?page=1&limit=10&search=admin&role=Admin
Authorization: Bearer <admin-token>
```

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10, max: 100)
- `search` (string): Search by username, email, or display name
- `role` (string): Filter by user role
- `sortBy` (string): Sort field (username, email, createdAt, lastLogin)
- `sortOrder` (string): Sort order (asc, desc)

**Response:**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": 1,
        "username": "admin",
        "email": "admin@foxshrine.com",
        "displayName": "Fox Admin",
        "role": "Admin",
        "isActive": true,
        "lastLogin": "2025-01-15T10:30:00Z",
        "loginCount": 42,
        "createdAt": "2025-01-01T00:00:00Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 47,
      "itemsPerPage": 10,
      "hasNextPage": true,
      "hasPreviousPage": false
    }
  }
}
```

### PUT /admin/users/:id/role

Updates a user's role.

**Request:**
```http
PUT /api/admin/users/2/role
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "role": "VIP",
  "reason": "Promoted for community contributions"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 2,
      "username": "user123",
      "role": "VIP",
      "permissions": [
        "content.read",
        "community.participate"
      ]
    },
    "changes": {
      "oldRole": "Member",
      "newRole": "VIP",
      "updatedBy": "admin",
      "updatedAt": "2025-01-15T10:30:00Z",
      "reason": "Promoted for community contributions"
    }
  }
}
```

### GET /admin/roles

Retrieves all available roles and their permissions.

**Request:**
```http
GET /api/admin/roles
Authorization: Bearer <admin-token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "roles": [
      {
        "id": 1,
        "name": "Guest",
        "description": "Anonymous users with read-only access",
        "permissions": ["content.read"],
        "userCount": 0
      },
      {
        "id": 2,
        "name": "Member",
        "description": "Registered users with basic privileges",
        "permissions": ["content.read", "community.participate"],
        "userCount": 25
      },
      {
        "id": 3,
        "name": "Admin",
        "description": "Administrative access to manage website",
        "permissions": [
          "config.read",
          "config.write",
          "users.read",
          "users.write",
          "content.read",
          "content.write"
        ],
        "userCount": 2
      }
    ]
  }
}
```

### GET /admin/users/:id/activity

Retrieves activity log for a specific user.

**Request:**
```http
GET /api/admin/users/2/activity?limit=50&days=30
Authorization: Bearer <admin-token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "activities": [
      {
        "id": 123,
        "action": "login",
        "details": "User logged in successfully",
        "ipAddress": "192.168.1.1",
        "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)...",
        "timestamp": "2025-01-15T10:30:00Z"
      },
      {
        "id": 122,
        "action": "profile_update",
        "details": "Updated display name",
        "changes": {
          "displayName": {
            "old": "Old Name",
            "new": "New Name"
          }
        },
        "timestamp": "2025-01-15T09:15:00Z"
      }
    ],
    "summary": {
      "totalActivities": 156,
      "loginCount": 42,
      "lastActivity": "2025-01-15T10:30:00Z"
    }
  }
}
```

## 📊 Analytics Endpoints

### GET /analytics/overview

Retrieves general analytics overview.

**Request:**
```http
GET /api/analytics/overview?period=30d
Authorization: Bearer <admin-token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "users": {
      "total": 150,
      "active": 75,
      "newThisMonth": 25
    },
    "sessions": {
      "total": 1250,
      "avgDuration": 15.5,
      "bounceRate": 0.25
    },
    "configuration": {
      "lastUpdate": "2025-01-15T10:30:00Z",
      "totalUpdates": 45
    },
    "performance": {
      "avgResponseTime": 120,
      "uptime": 99.9
    }
  }
}
```

### GET /analytics/users

Retrieves user analytics data.

**Request:**
```http
GET /api/analytics/users?period=7d&groupBy=day
Authorization: Bearer <admin-token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "userGrowth": [
      {
        "date": "2025-01-15",
        "newUsers": 5,
        "totalUsers": 150,
        "activeUsers": 75
      }
    ],
    "roleDistribution": {
      "Guest": 0,
      "Member": 140,
      "VIP": 8,
      "Admin": 2
    },
    "activityTrends": {
      "logins": 450,
      "profileUpdates": 25,
      "configChanges": 8
    }
  }
}
```

### GET /analytics/performance

Retrieves performance metrics.

**Request:**
```http
GET /api/analytics/performance?period=24h
Authorization: Bearer <admin-token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "responseTime": {
      "avg": 120,
      "p95": 250,
      "p99": 500
    },
    "requests": {
      "total": 15000,
      "successful": 14850,
      "failed": 150,
      "errorRate": 0.01
    },
    "endpoints": [
      {
        "path": "/api/config",
        "requests": 5000,
        "avgResponseTime": 80,
        "errorRate": 0.001
      }
    ]
  }
}
```

## 🔒 Security Features

### Rate Limiting

API endpoints are protected by rate limiting:

**Default Limits:**
- **Authentication**: 5 requests per minute per IP
- **Configuration**: 30 requests per minute per user
- **General API**: 100 requests per minute per IP

**Rate Limit Headers:**
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642176000
```

**Rate Limit Exceeded Response:**
```json
{
  "success": false,
  "error": "Rate limit exceeded",
  "code": "RATE_LIMIT_EXCEEDED",
  "details": {
    "limit": 100,
    "remaining": 0,
    "resetTime": "2025-01-15T11:00:00Z"
  }
}
```

### Input Validation

All endpoints validate input data:

**Validation Rules:**
- **Username**: 3-30 characters, alphanumeric + underscore
- **Email**: Valid email format
- **Password**: Minimum 8 characters
- **Configuration keys**: Dot notation, alphanumeric
- **Configuration values**: Type-specific validation

**Validation Error Response:**
```json
{
  "success": false,
  "error": "Validation failed",
  "code": "VALIDATION_ERROR",
  "details": {
    "fields": {
      "username": "Username must be 3-30 characters",
      "email": "Invalid email format",
      "password": "Password must be at least 8 characters"
    }
  }
}
```

### Permissions System

Each endpoint requires specific permissions:

**Permission Categories:**
- `config.*` - Configuration management
- `users.*` - User management
- `content.*` - Content management
- `analytics.*` - Analytics access
- `system.*` - System administration

**Permission Denied Response:**
```json
{
  "success": false,
  "error": "Insufficient permissions",
  "code": "PERMISSION_DENIED",
  "details": {
    "required": "config.write",
    "userPermissions": ["config.read", "content.read"]
  }
}
```

## 📝 Data Models

### User Model

```typescript
interface User {
  id: number;
  username: string;
  email: string;
  displayName: string;
  role: 'Guest' | 'Member' | 'VIP' | 'Moderator' | 'Admin' | 'Super Admin';
  permissions: string[];
  isActive: boolean;
  lastLogin: string; // ISO date
  loginCount: number;
  failedLoginAttempts: number;
  lockedUntil?: string; // ISO date
  createdAt: string; // ISO date
  updatedAt: string; // ISO date
}
```

### Configuration Model

```typescript
interface Configuration {
  siteTitle: string;
  siteDescription: string;
  siteLogo: string;
  siteUrl: string;
  
  character: {
    name: string;
    description: string;
    image: string;
    greeting: string;
  };
  
  social: {
    twitchUrl: string;
    youtubeUrl: string;
    twitterUrl: string;
    discordUrl: string;
    instagramUrl: string;
  };
  
  stream: {
    title: string;
    category: string;
    isLive: boolean;
    nextStreamDate: string;
    notification: string;
  };
  
  theme: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    backgroundColor: string;
    fontFamily: string;
  };
  
  features: {
    showMerch: boolean;
    showDonations: boolean;
    showSchedule: boolean;
    showLatestVideos: boolean;
    enableNotifications: boolean;
  };
  
  content: {
    heroTitle: string;
    heroSubtitle: string;
    aboutText: string;
  };
  
  contact: {
    businessEmail: string;
    fanEmail: string;
    supportEmail: string;
  };
  
  system: {
    maintenanceMode: boolean;
    maintenanceMessage: string;
    emergencyNotice: string;
  };
}
```

### Session Model

```typescript
interface Session {
  id: string;
  userId: number;
  accessToken: string;
  refreshToken: string;
  ipAddress: string;
  userAgent: string;
  isActive: boolean;
  expiresAt: string; // ISO date
  createdAt: string; // ISO date
  lastActivity: string; // ISO date
}
```

### Activity Log Model

```typescript
interface ActivityLog {
  id: number;
  userId: number;
  sessionId: string;
  action: string;
  details: string;
  ipAddress: string;
  userAgent: string;
  changes?: Record<string, any>;
  timestamp: string; // ISO date
}
```

## 🚨 Error Codes

### HTTP Status Codes

| Code | Status | Description |
|------|--------|-------------|
| 200 | OK | Request successful |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Invalid request data |
| 401 | Unauthorized | Authentication required |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 422 | Unprocessable Entity | Validation failed |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |

### Application Error Codes

| Code | Description |
|------|-------------|
| `INVALID_CREDENTIALS` | Username or password incorrect |
| `ACCOUNT_LOCKED` | Account locked due to failed attempts |
| `TOKEN_EXPIRED` | JWT token has expired |
| `TOKEN_INVALID` | JWT token is invalid or malformed |
| `PERMISSION_DENIED` | User lacks required permissions |
| `VALIDATION_ERROR` | Input validation failed |
| `RATE_LIMIT_EXCEEDED` | Too many requests |
| `USER_NOT_FOUND` | User does not exist |
| `CONFIG_KEY_INVALID` | Configuration key is invalid |
| `DATABASE_ERROR` | Database operation failed |

## 🧪 Testing

### API Testing

**Using curl:**
```bash
# Login
curl -X POST http://localhost:3002/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password"}'

# Get configuration
curl -X GET http://localhost:3002/api/config

# Update configuration (requires admin token)
curl -X PUT http://localhost:3002/api/config/siteTitle \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"value":"Updated Title"}'
```

**Using Postman:**
1. Import the API collection (available in `/docs/postman`)
2. Set environment variables for base URL and tokens
3. Run authentication requests first
4. Use returned tokens for protected endpoints

### Authentication Testing

**Test Authentication Flow:**
```javascript
// 1. Register new user
const registerResponse = await fetch('/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: 'testuser',
    email: 'test@example.com',
    password: 'password123',
    displayName: 'Test User'
  })
});

// 2. Login with credentials
const loginResponse = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: 'testuser',
    password: 'password123'
  })
});

// 3. Use token for protected endpoints
const { tokens } = await loginResponse.json();
const profileResponse = await fetch('/api/auth/profile', {
  headers: { 'Authorization': `Bearer ${tokens.accessToken}` }
});
```

## 📋 Examples

### Authentication Flow

**Complete Authentication Example:**
```javascript
class APIClient {
  constructor(baseURL) {
    this.baseURL = baseURL;
    this.token = localStorage.getItem('accessToken');
  }

  async login(username, password) {
    const response = await fetch(`${this.baseURL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    const data = await response.json();
    
    if (data.success) {
      this.token = data.data.tokens.accessToken;
      localStorage.setItem('accessToken', this.token);
      localStorage.setItem('refreshToken', data.data.tokens.refreshToken);
      return data.data.user;
    } else {
      throw new Error(data.error);
    }
  }

  async apiCall(endpoint, options = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers
    });

    if (response.status === 401) {
      // Token expired, try to refresh
      await this.refreshToken();
      // Retry original request
      return this.apiCall(endpoint, options);
    }

    return response.json();
  }

  async refreshToken() {
    const refreshToken = localStorage.getItem('refreshToken');
    
    const response = await fetch(`${this.baseURL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken })
    });

    const data = await response.json();
    
    if (data.success) {
      this.token = data.data.tokens.accessToken;
      localStorage.setItem('accessToken', this.token);
      localStorage.setItem('refreshToken', data.data.tokens.refreshToken);
    } else {
      // Refresh failed, redirect to login
      this.logout();
      throw new Error('Session expired');
    }
  }

  async logout() {
    if (this.token) {
      await fetch(`${this.baseURL}/auth/logout`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${this.token}` }
      });
    }
    
    this.token = null;
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }
}

// Usage
const api = new APIClient('http://localhost:3002/api');

// Login
const user = await api.login('admin', 'password');

// Make authenticated requests
const config = await api.apiCall('/config');
const users = await api.apiCall('/admin/users');
```

### Configuration Management

**Configuration Update Example:**
```javascript
// Update single configuration value
async function updateSiteTitle(newTitle) {
  const response = await api.apiCall('/config/siteTitle', {
    method: 'PUT',
    body: JSON.stringify({
      value: newTitle,
      category: 'general'
    })
  });
  
  return response;
}

// Update multiple configuration values
async function updateTheme(themeConfig) {
  const updates = Object.entries(themeConfig).map(([key, value]) => ({
    key: `theme.${key}`,
    value
  }));
  
  const response = await api.apiCall('/config', {
    method: 'PUT',
    body: JSON.stringify({
      updates
    })
  });
  
  return response;
}

// Usage
await updateSiteTitle('My VTuber Shrine');
await updateTheme({
  primaryColor: '#FF0000',
  secondaryColor: '#00FF00',
  fontFamily: 'Arial, sans-serif'
});
```

### User Management

**User Management Example:**
```javascript
// Get users with pagination and filtering
async function getUsers(page = 1, filters = {}) {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: '10',
    ...filters
  });
  
  const response = await api.apiCall(`/admin/users?${params}`);
  return response;
}

// Update user role
async function updateUserRole(userId, newRole, reason) {
  const response = await api.apiCall(`/admin/users/${userId}/role`, {
    method: 'PUT',
    body: JSON.stringify({
      role: newRole,
      reason
    })
  });
  
  return response;
}

// Get user activity log
async function getUserActivity(userId, days = 30) {
  const response = await api.apiCall(
    `/admin/users/${userId}/activity?days=${days}`
  );
  return response;
}

// Usage
const users = await getUsers(1, { role: 'Member', search: 'john' });
await updateUserRole(2, 'VIP', 'Active community member');
const activity = await getUserActivity(2, 7);
```

---

**🔌 API Reference Complete!**

This documentation covers all available API endpoints and functionality. For additional support:

1. Check the API server logs for debugging
2. Use the provided examples as starting points
3. Test endpoints with Postman or curl
4. Open an issue for API bugs or feature requests

**Security Reminders:**
- Always use HTTPS in production
- Store JWT tokens securely
- Implement proper rate limiting
- Validate all input data
- Log security events

Happy coding! 🚀✨