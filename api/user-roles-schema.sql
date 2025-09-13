-- Fox Shrine VTuber Website - User Roles & Authentication Schema
-- This extends the existing Configuration system with user management

-- =============================================
-- USER ROLES AND AUTHENTICATION TABLES
-- =============================================

-- Create Roles table for different user types
CREATE TABLE [dbo].[Roles] (
    [Id] INT IDENTITY(1,1) PRIMARY KEY,
    [Name] NVARCHAR(50) NOT NULL UNIQUE,
    [Description] NVARCHAR(255) NULL,
    [IsActive] BIT NOT NULL DEFAULT 1,
    [CreatedAt] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    [UpdatedAt] DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

-- Create Users table
CREATE TABLE [dbo].[Users] (
    [Id] INT IDENTITY(1,1) PRIMARY KEY,
    [Username] NVARCHAR(50) NOT NULL UNIQUE,
    [Email] NVARCHAR(255) NOT NULL UNIQUE,
    [PasswordHash] NVARCHAR(255) NOT NULL, -- BCrypt hash
    [DisplayName] NVARCHAR(100) NULL,
    [Avatar] NVARCHAR(500) NULL,
    [RoleId] INT NOT NULL,
    [IsActive] BIT NOT NULL DEFAULT 1,
    [IsEmailVerified] BIT NOT NULL DEFAULT 0,
    [EmailVerificationToken] NVARCHAR(255) NULL,
    [PasswordResetToken] NVARCHAR(255) NULL,
    [PasswordResetExpires] DATETIME2 NULL,
    [LastLoginAt] DATETIME2 NULL,
    [LoginAttempts] INT NOT NULL DEFAULT 0,
    [LockedUntil] DATETIME2 NULL,
    [CreatedAt] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    [UpdatedAt] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    [CreatedBy] NVARCHAR(100) NOT NULL DEFAULT 'system',
    
    CONSTRAINT FK_Users_Roles FOREIGN KEY ([RoleId]) REFERENCES [dbo].[Roles]([Id])
);

-- Create Permissions table for granular access control
CREATE TABLE [dbo].[Permissions] (
    [Id] INT IDENTITY(1,1) PRIMARY KEY,
    [Name] NVARCHAR(100) NOT NULL UNIQUE,
    [Description] NVARCHAR(255) NULL,
    [Category] NVARCHAR(50) NOT NULL DEFAULT 'general',
    [IsActive] BIT NOT NULL DEFAULT 1,
    [CreatedAt] DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

-- Create Role Permissions junction table
CREATE TABLE [dbo].[RolePermissions] (
    [Id] INT IDENTITY(1,1) PRIMARY KEY,
    [RoleId] INT NOT NULL,
    [PermissionId] INT NOT NULL,
    [GrantedAt] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    [GrantedBy] NVARCHAR(100) NOT NULL DEFAULT 'system',
    
    CONSTRAINT FK_RolePermissions_Roles FOREIGN KEY ([RoleId]) REFERENCES [dbo].[Roles]([Id]) ON DELETE CASCADE,
    CONSTRAINT FK_RolePermissions_Permissions FOREIGN KEY ([PermissionId]) REFERENCES [dbo].[Permissions]([Id]) ON DELETE CASCADE,
    CONSTRAINT UK_RolePermissions_Role_Permission UNIQUE ([RoleId], [PermissionId])
);

-- Create User Sessions table for JWT token management
CREATE TABLE [dbo].[UserSessions] (
    [Id] INT IDENTITY(1,1) PRIMARY KEY,
    [UserId] INT NOT NULL,
    [SessionToken] NVARCHAR(500) NOT NULL UNIQUE,
    [RefreshToken] NVARCHAR(500) NOT NULL UNIQUE,
    [IPAddress] NVARCHAR(45) NULL,
    [UserAgent] NVARCHAR(500) NULL,
    [IsActive] BIT NOT NULL DEFAULT 1,
    [ExpiresAt] DATETIME2 NOT NULL,
    [CreatedAt] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    [LastAccessedAt] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    
    CONSTRAINT FK_UserSessions_Users FOREIGN KEY ([UserId]) REFERENCES [dbo].[Users]([Id]) ON DELETE CASCADE
);

-- Create User Activity Log table
CREATE TABLE [dbo].[UserActivityLog] (
    [Id] INT IDENTITY(1,1) PRIMARY KEY,
    [UserId] INT NULL, -- NULL for anonymous actions
    [Action] NVARCHAR(100) NOT NULL,
    [Details] NVARCHAR(MAX) NULL,
    [IPAddress] NVARCHAR(45) NULL,
    [UserAgent] NVARCHAR(500) NULL,
    [Timestamp] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    [SessionId] INT NULL,
    
    CONSTRAINT FK_UserActivityLog_Users FOREIGN KEY ([UserId]) REFERENCES [dbo].[Users]([Id]),
    CONSTRAINT FK_UserActivityLog_Sessions FOREIGN KEY ([SessionId]) REFERENCES [dbo].[UserSessions]([Id])
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

-- Users table indexes
CREATE INDEX IX_Users_Email ON [dbo].[Users] ([Email]);
CREATE INDEX IX_Users_Username ON [dbo].[Users] ([Username]);
CREATE INDEX IX_Users_Role_Active ON [dbo].[Users] ([RoleId], [IsActive]);
CREATE INDEX IX_Users_LastLogin ON [dbo].[Users] ([LastLoginAt]);

-- Sessions table indexes
CREATE INDEX IX_UserSessions_User_Active ON [dbo].[UserSessions] ([UserId], [IsActive]);
CREATE INDEX IX_UserSessions_Token ON [dbo].[UserSessions] ([SessionToken]);
CREATE INDEX IX_UserSessions_Refresh ON [dbo].[UserSessions] ([RefreshToken]);
CREATE INDEX IX_UserSessions_Expires ON [dbo].[UserSessions] ([ExpiresAt]);

-- Activity log indexes
CREATE INDEX IX_UserActivityLog_User_Timestamp ON [dbo].[UserActivityLog] ([UserId], [Timestamp]);
CREATE INDEX IX_UserActivityLog_Action ON [dbo].[UserActivityLog] ([Action]);
CREATE INDEX IX_UserActivityLog_Timestamp ON [dbo].[UserActivityLog] ([Timestamp]);

-- =============================================
-- INSERT DEFAULT ROLES AND PERMISSIONS
-- =============================================

-- Insert default roles
INSERT INTO [dbo].[Roles] ([Name], [Description]) VALUES
('Super Admin', 'Full system access with all permissions'),
('Admin', 'Administrative access to manage website content and users'),
('Moderator', 'Limited administrative access for content moderation'),
('VIP', 'VIP members with special privileges'),
('Member', 'Registered members with basic privileges'),
('Guest', 'Anonymous users with read-only access');

-- Insert permissions for Fox Shrine VTuber website
INSERT INTO [dbo].[Permissions] ([Name], [Description], [Category]) VALUES
-- Configuration Management
('config.read', 'View website configuration', 'configuration'),
('config.write', 'Modify website configuration', 'configuration'),
('config.delete', 'Delete configuration entries', 'configuration'),
('config.audit', 'View configuration audit logs', 'configuration'),

-- Stream Management
('stream.read', 'View stream information', 'stream'),
('stream.write', 'Update stream status and information', 'stream'),
('stream.schedule', 'Manage stream schedule', 'stream'),
('stream.notifications', 'Send stream notifications', 'stream'),

-- Content Management
('content.read', 'View website content', 'content'),
('content.write', 'Create and edit content', 'content'),
('content.delete', 'Delete content', 'content'),
('content.publish', 'Publish/unpublish content', 'content'),

-- User Management
('users.read', 'View user information', 'users'),
('users.write', 'Create and edit users', 'users'),
('users.delete', 'Delete users', 'users'),
('users.roles', 'Manage user roles and permissions', 'users'),
('users.sessions', 'Manage user sessions', 'users'),

-- Analytics and Monitoring
('analytics.read', 'View website analytics', 'analytics'),
('logs.read', 'View system logs', 'logs'),
('logs.export', 'Export log data', 'logs'),

-- System Administration
('system.maintenance', 'Enable/disable maintenance mode', 'system'),
('system.backup', 'Perform system backups', 'system'),
('system.settings', 'Modify system settings', 'system'),

-- Social Media Management
('social.read', 'View social media settings', 'social'),
('social.write', 'Update social media links and content', 'social'),

-- Merchandise Management
('merch.read', 'View merchandise information', 'merchandise'),
('merch.write', 'Manage merchandise listings', 'merchandise'),
('merch.orders', 'View and manage orders', 'merchandise'),

-- Community Features
('community.read', 'View community features', 'community'),
('community.moderate', 'Moderate community content', 'community'),
('community.ban', 'Ban/unban community members', 'community');

-- =============================================
-- ASSIGN PERMISSIONS TO ROLES
-- =============================================

-- Super Admin gets ALL permissions
INSERT INTO [dbo].[RolePermissions] ([RoleId], [PermissionId])
SELECT r.[Id], p.[Id]
FROM [dbo].[Roles] r
CROSS JOIN [dbo].[Permissions] p
WHERE r.[Name] = 'Super Admin';

-- Admin gets most permissions (excluding super admin specific ones)
INSERT INTO [dbo].[RolePermissions] ([RoleId], [PermissionId])
SELECT r.[Id], p.[Id]
FROM [dbo].[Roles] r
CROSS JOIN [dbo].[Permissions] p
WHERE r.[Name] = 'Admin'
AND p.[Name] NOT IN ('users.delete', 'system.backup', 'logs.export');

-- Moderator gets content and community management permissions
INSERT INTO [dbo].[RolePermissions] ([RoleId], [PermissionId])
SELECT r.[Id], p.[Id]
FROM [dbo].[Roles] r
CROSS JOIN [dbo].[Permissions] p
WHERE r.[Name] = 'Moderator'
AND p.[Name] IN (
    'config.read', 'stream.read', 'content.read', 'content.write', 'content.publish',
    'community.read', 'community.moderate', 'social.read', 'merch.read',
    'analytics.read', 'logs.read'
);

-- VIP gets enhanced read permissions
INSERT INTO [dbo].[RolePermissions] ([RoleId], [PermissionId])
SELECT r.[Id], p.[Id]
FROM [dbo].[Roles] r
CROSS JOIN [dbo].[Permissions] p
WHERE r.[Name] = 'VIP'
AND p.[Name] IN (
    'config.read', 'stream.read', 'content.read', 'community.read',
    'social.read', 'merch.read', 'analytics.read'
);

-- Member gets basic read permissions
INSERT INTO [dbo].[RolePermissions] ([RoleId], [PermissionId])
SELECT r.[Id], p.[Id]
FROM [dbo].[Roles] r
CROSS JOIN [dbo].[Permissions] p
WHERE r.[Name] = 'Member'
AND p.[Name] IN (
    'config.read', 'stream.read', 'content.read', 'community.read',
    'social.read', 'merch.read'
);

-- Guest gets minimal read-only permissions
INSERT INTO [dbo].[RolePermissions] ([RoleId], [PermissionId])
SELECT r.[Id], p.[Id]
FROM [dbo].[Roles] r
CROSS JOIN [dbo].[Permissions] p
WHERE r.[Name] = 'Guest'
AND p.[Name] IN (
    'config.read', 'stream.read', 'content.read', 'social.read', 'merch.read'
);

-- =============================================
-- CREATE DEFAULT ADMIN USER
-- =============================================

-- Insert default admin user (password: 'FoxShrine2025!' - CHANGE THIS!)
INSERT INTO [dbo].[Users] ([Username], [Email], [PasswordHash], [DisplayName], [RoleId], [IsActive], [IsEmailVerified], [CreatedBy])
SELECT 
    'foxadmin',
    'admin@foxshrinevtuber.com',
    '$2b$12$LQv3c1yqBwEHxv03kpOFQudZL7vw0QvYGKcMfhPGYm8hgP1HxKRv2', -- BCrypt hash for 'FoxShrine2025!'
    'Fox Shrine Admin',
    r.[Id],
    1,
    1,
    'system'
FROM [dbo].[Roles] r
WHERE r.[Name] = 'Super Admin';

-- =============================================
-- TRIGGERS FOR AUTOMATIC TIMESTAMPS
-- =============================================

-- Trigger for Users UpdatedAt
CREATE TRIGGER TR_Users_UpdatedAt
ON [dbo].[Users]
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE [dbo].[Users]
    SET [UpdatedAt] = GETUTCDATE()
    WHERE [Id] IN (SELECT DISTINCT [Id] FROM INSERTED);
END;

-- Trigger for Roles UpdatedAt
CREATE TRIGGER TR_Roles_UpdatedAt
ON [dbo].[Roles]
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE [dbo].[Roles]
    SET [UpdatedAt] = GETUTCDATE()
    WHERE [Id] IN (SELECT DISTINCT [Id] FROM INSERTED);
END;

-- =============================================
-- STORED PROCEDURES FOR USER MANAGEMENT
-- =============================================

-- Get user with role and permissions
CREATE PROCEDURE [dbo].[GetUserWithPermissions]
    @Username NVARCHAR(50) = NULL,
    @Email NVARCHAR(255) = NULL,
    @UserId INT = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        u.[Id], u.[Username], u.[Email], u.[DisplayName], u.[Avatar],
        u.[IsActive], u.[IsEmailVerified], u.[LastLoginAt], u.[CreatedAt],
        r.[Name] as RoleName, r.[Description] as RoleDescription,
        STRING_AGG(p.[Name], ',') as Permissions
    FROM [dbo].[Users] u
    INNER JOIN [dbo].[Roles] r ON u.[RoleId] = r.[Id]
    LEFT JOIN [dbo].[RolePermissions] rp ON r.[Id] = rp.[RoleId]
    LEFT JOIN [dbo].[Permissions] p ON rp.[PermissionId] = p.[Id] AND p.[IsActive] = 1
    WHERE u.[IsActive] = 1
        AND (@Username IS NULL OR u.[Username] = @Username)
        AND (@Email IS NULL OR u.[Email] = @Email)
        AND (@UserId IS NULL OR u.[Id] = @UserId)
    GROUP BY u.[Id], u.[Username], u.[Email], u.[DisplayName], u.[Avatar],
             u.[IsActive], u.[IsEmailVerified], u.[LastLoginAt], u.[CreatedAt],
             r.[Name], r.[Description];
END;

-- Create new user
CREATE PROCEDURE [dbo].[CreateUser]
    @Username NVARCHAR(50),
    @Email NVARCHAR(255),
    @PasswordHash NVARCHAR(255),
    @DisplayName NVARCHAR(100) = NULL,
    @RoleName NVARCHAR(50) = 'Member',
    @CreatedBy NVARCHAR(100) = 'system'
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @RoleId INT;
    DECLARE @UserId INT;
    
    -- Get role ID
    SELECT @RoleId = [Id] FROM [dbo].[Roles] WHERE [Name] = @RoleName AND [IsActive] = 1;
    
    IF @RoleId IS NULL
    BEGIN
        RAISERROR('Invalid role specified', 16, 1);
        RETURN;
    END
    
    -- Insert user
    INSERT INTO [dbo].[Users] ([Username], [Email], [PasswordHash], [DisplayName], [RoleId], [CreatedBy])
    VALUES (@Username, @Email, @PasswordHash, @DisplayName, @RoleId, @CreatedBy);
    
    SET @UserId = SCOPE_IDENTITY();
    
    -- Return created user with permissions
    EXEC [dbo].[GetUserWithPermissions] @UserId = @UserId;
END;

-- Update user role
CREATE PROCEDURE [dbo].[UpdateUserRole]
    @UserId INT,
    @RoleName NVARCHAR(50),
    @UpdatedBy NVARCHAR(100) = 'system'
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @RoleId INT;
    
    -- Get role ID
    SELECT @RoleId = [Id] FROM [dbo].[Roles] WHERE [Name] = @RoleName AND [IsActive] = 1;
    
    IF @RoleId IS NULL
    BEGIN
        RAISERROR('Invalid role specified', 16, 1);
        RETURN;
    END
    
    -- Update user role
    UPDATE [dbo].[Users]
    SET [RoleId] = @RoleId, [UpdatedAt] = GETUTCDATE()
    WHERE [Id] = @UserId AND [IsActive] = 1;
    
    -- Log activity
    INSERT INTO [dbo].[UserActivityLog] ([UserId], [Action], [Details])
    VALUES (@UserId, 'ROLE_UPDATED', CONCAT('Role changed to: ', @RoleName, ' by: ', @UpdatedBy));
    
    -- Return updated user
    EXEC [dbo].[GetUserWithPermissions] @UserId = @UserId;
END;

-- Check user permission
CREATE PROCEDURE [dbo].[CheckUserPermission]
    @UserId INT,
    @Permission NVARCHAR(100)
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        CASE 
            WHEN COUNT(*) > 0 THEN 1 
            ELSE 0 
        END as HasPermission
    FROM [dbo].[Users] u
    INNER JOIN [dbo].[Roles] r ON u.[RoleId] = r.[Id]
    INNER JOIN [dbo].[RolePermissions] rp ON r.[Id] = rp.[RoleId]
    INNER JOIN [dbo].[Permissions] p ON rp.[PermissionId] = p.[Id]
    WHERE u.[Id] = @UserId 
        AND u.[IsActive] = 1 
        AND r.[IsActive] = 1 
        AND p.[IsActive] = 1
        AND p.[Name] = @Permission;
END;

-- Get all roles with permissions
CREATE PROCEDURE [dbo].[GetRolesWithPermissions]
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        r.[Id], r.[Name], r.[Description], r.[IsActive], r.[CreatedAt],
        STRING_AGG(p.[Name], ',') as Permissions,
        COUNT(p.[Id]) as PermissionCount
    FROM [dbo].[Roles] r
    LEFT JOIN [dbo].[RolePermissions] rp ON r.[Id] = rp.[RoleId]
    LEFT JOIN [dbo].[Permissions] p ON rp.[PermissionId] = p.[Id] AND p.[IsActive] = 1
    WHERE r.[IsActive] = 1
    GROUP BY r.[Id], r.[Name], r.[Description], r.[IsActive], r.[CreatedAt]
    ORDER BY r.[Name];
END;

-- Log user activity
CREATE PROCEDURE [dbo].[LogUserActivity]
    @UserId INT = NULL,
    @Action NVARCHAR(100),
    @Details NVARCHAR(MAX) = NULL,
    @IPAddress NVARCHAR(45) = NULL,
    @UserAgent NVARCHAR(500) = NULL,
    @SessionId INT = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    INSERT INTO [dbo].[UserActivityLog] ([UserId], [Action], [Details], [IPAddress], [UserAgent], [SessionId])
    VALUES (@UserId, @Action, @Details, @IPAddress, @UserAgent, @SessionId);
END;

-- Clean expired sessions
CREATE PROCEDURE [dbo].[CleanExpiredSessions]
AS
BEGIN
    SET NOCOUNT ON;
    
    DELETE FROM [dbo].[UserSessions]
    WHERE [ExpiresAt] < GETUTCDATE() OR [IsActive] = 0;
    
    SELECT @@ROWCOUNT as DeletedSessions;
END;
