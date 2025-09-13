# Fox Shrine VTuber Website - User Roles & Authentication System

## 🎯 Overview

A comprehensive user authentication and authorization system has been implemented for the Fox Shrine VTuber website, providing granular permissions management for different user types from guests to administrators.

## 📊 Database Schema

### Core Tables

#### 1. **Roles Table**
- **Purpose**: Defines different user role types
- **Default Roles**:
  - `Super Admin` - Full system access with all permissions
  - `Admin` - Administrative access to manage website content and users
  - `Moderator` - Limited administrative access for content moderation
  - `VIP` - VIP members with special privileges
  - `Member` - Registered members with basic privileges
  - `Guest` - Anonymous users with read-only access

#### 2. **Users Table**
- **Purpose**: Stores user account information
- **Features**:
  - BCrypt password hashing
  - Email verification system
  - Account locking after failed login attempts
  - Login attempt tracking
  - Password reset tokens
  - Default admin user: `foxadmin` (password: `FoxShrine2025!` - **CHANGE THIS!**)

#### 3. **Permissions Table**
- **Purpose**: Defines granular permissions across different categories
- **Categories**:
  - **Configuration Management**: `config.read`, `config.write`, `config.delete`, `config.audit`
  - **Stream Management**: `stream.read`, `stream.write`, `stream.schedule`, `stream.notifications`
  - **Content Management**: `content.read`, `content.write`, `content.delete`, `content.publish`
  - **User Management**: `users.read`, `users.write`, `users.delete`, `users.roles`, `users.sessions`
  - **Analytics & Monitoring**: `analytics.read`, `logs.read`, `logs.export`
  - **System Administration**: `system.maintenance`, `system.backup`, `system.settings`
  - **Social Media**: `social.read`, `social.write`
  - **Merchandise**: `merch.read`, `merch.write`, `merch.orders`
  - **Community Features**: `community.read`, `community.moderate`, `community.ban`

#### 4. **Supporting Tables**
- `RolePermissions` - Junction table linking roles to permissions
- `UserSessions` - JWT token management and session tracking
- `UserActivityLog` - Complete audit trail of user actions

## 🔐 API Endpoints

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login with session management
- `GET /api/auth/profile` - Get current user profile
- `POST /api/auth/logout` - User logout with session cleanup

### Admin Management Endpoints
- `GET /api/admin/users` - List all users (paginated, searchable)
- `PUT /api/admin/users/:id/role` - Update user role
- `GET /api/admin/roles` - Get all roles with permissions

### Configuration Endpoints (Updated with Permissions)
- `GET /api/config` - Read configuration (guests allowed, activity logged for users)
- `PUT /api/config` - Bulk update configuration (admin only)
- `DELETE /api/config/:key` - Delete configuration (admin only)

## 🛡️ Security Features

### Password Security
- **BCrypt Hashing**: 12 rounds for strong password protection
- **Password Requirements**: Minimum 8 characters
- **Account Locking**: 30-minute lockout after 5 failed attempts

### Session Management
- **JWT Tokens**: Access tokens with 24-hour expiry
- **Refresh Tokens**: 7-day expiry for token renewal
- **Session Tracking**: IP address and user agent logging
- **Automatic Cleanup**: Expired sessions are automatically removed

### Activity Logging
- **Complete Audit Trail**: All user actions are logged
- **IP Tracking**: Track user locations for security
- **Session Correlation**: Link activities to specific sessions

## 🎨 Frontend Integration

### React Authentication Hook (`useAuth.js`)
```javascript
const { user, login, logout, hasPermission, isAdmin } = useAuth();
```

**Features**:
- Automatic token management
- Permission checking utilities
- Role-based access control
- Network error handling
- Offline token storage

### Authentication Modal (`AuthModal.jsx`)
- **Unified Login/Register** component
- **Form Validation** with real-time feedback
- **Loading States** and error handling
- **Guest-friendly** messaging

### Admin Dashboard (`AdminDashboard.jsx`)
- **Permission-Gated Tabs**: Users only see what they can access
- **User Management**: View and update user roles
- **Role Overview**: See all roles and their permissions
- **Configuration Management**: Update website settings
- **Real-time Updates**: Changes reflect immediately

### Permission Components
```javascript
// Protect entire components
const ProtectedComponent = withAuth(MyComponent, 'config.write');

// Conditional rendering
<PermissionGate permission="users.read">
  <AdminPanel />
</PermissionGate>

// Role-based access
<PermissionGate adminOnly>
  <SuperAdminFeatures />
</PermissionGate>
```

## 📋 Permission Matrix

| Role | Config Management | User Management | Content Management | System Admin |
|------|------------------|-----------------|-------------------|-------------|
| **Guest** | Read Only | ❌ | Read Only | ❌ |
| **Member** | Read Only | ❌ | Read Only | ❌ |
| **VIP** | Read Only | ❌ | Read Only | ❌ |
| **Moderator** | Read Only | ❌ | Read, Write, Publish | ❌ |
| **Admin** | Full Access | Create, Edit, Roles | Full Access | Limited |
| **Super Admin** | Full Access | Full Access | Full Access | Full Access |

## 🚀 Deployment Instructions

### 1. Database Setup
```sql
-- Run in your Azure SQL Database
-- First run the original database-schema.sql
-- Then run the new user-roles-schema.sql
```

### 2. Environment Variables
Add to your `api/.env` file:
```env
# Authentication
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=24h
REFRESH_TOKEN_EXPIRES_IN=7d

# Existing database config...
DB_PASSWORD=your-actual-password
```

### 3. Install Dependencies
```bash
cd api
npm install bcrypt jsonwebtoken
```

### 4. Frontend Integration
```javascript
// In your main App.js
import { AuthProvider } from './hooks/useAuth';

function App() {
  return (
    <AuthProvider>
      {/* Your existing app */}
    </AuthProvider>
  );
}
```

## 🔧 Admin Features for Website Configuration

### What Admins Can Control:
1. **User Management**
   - View all registered users
   - Change user roles (Member → VIP → Moderator → Admin)
   - Monitor user activity and login history

2. **Website Configuration**
   - Update VTuber character information
   - Modify social media links
   - Change stream schedule settings
   - Update merchandise information
   - Control site-wide announcements

3. **Content Management**
   - Publish/unpublish content
   - Moderate community features
   - Manage stream notifications
   - Control website maintenance mode

4. **Analytics & Monitoring**
   - View user activity logs
   - Monitor system performance
   - Access configuration audit trails
   - Export data for analysis

## 🎭 User Experience

### Guests (Unauthenticated)
- ✅ Browse website content
- ✅ View stream information
- ✅ Access social media links
- ❌ Cannot modify anything
- 🎯 Encouraged to register for exclusive features

### Members (Registered Users)
- ✅ All guest privileges
- ✅ Personalized experience
- ✅ Access to member-only content
- ✅ Community participation
- 🎯 Can be promoted to VIP by admins

### Admins
- ✅ Full control over website configuration
- ✅ User management capabilities
- ✅ Content publishing tools
- ✅ System monitoring access
- 🎯 Responsible for maintaining the Fox Shrine experience

## 🔒 Security Best Practices Implemented

1. **Password Security**: BCrypt hashing with high salt rounds
2. **Session Management**: Secure JWT tokens with proper expiration
3. **Activity Logging**: Complete audit trail for accountability
4. **Permission System**: Principle of least privilege
5. **Account Protection**: Automatic lockout on suspicious activity
6. **Data Validation**: Input sanitization and validation
7. **CORS Protection**: Restricted cross-origin requests
8. **Rate Limiting**: Protection against brute force attacks

## 📚 Usage Examples

### For Developers
```javascript
// Check if user can edit configuration
if (hasPermission('config.write')) {
  // Show edit interface
}

// Admin-only features
if (isAdmin()) {
  // Show admin dashboard
}

// Protected API calls
const response = await apiCall('/admin/users', { method: 'GET' });
```

### For Admins
1. **Login** with admin credentials
2. **Navigate** to Admin Dashboard
3. **Manage Users**: Change roles, monitor activity
4. **Update Configuration**: Modify website settings
5. **Monitor System**: View logs and analytics

## 🎉 Next Steps

1. **Set Database Password**: Update the `DB_PASSWORD` in your `.env` file
2. **Run Database Schema**: Execute both SQL files in your Azure SQL Database
3. **Test Authentication**: Register a test user and verify permissions
4. **Change Default Admin Password**: Login as `foxadmin` and change the password
5. **Integrate with Frontend**: Add authentication to your existing React components

The system is now ready to provide secure, role-based access control for your Fox Shrine VTuber website! 🦊✨
