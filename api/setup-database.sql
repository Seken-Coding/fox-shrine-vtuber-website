USE [master];
GO

IF OBJECT_ID('tempdb..#SetupOptions') IS NOT NULL
    DROP TABLE #SetupOptions;

CREATE TABLE #SetupOptions
(
    CreateAppLogin BIT NOT NULL,
    AppLogin SYSNAME NOT NULL,
    AppPassword NVARCHAR(128) NOT NULL,
    GrantExecuteToApp BIT NOT NULL,
    DefaultAdminPasswordHash NVARCHAR(255) NOT NULL
);

INSERT INTO #SetupOptions (CreateAppLogin, AppLogin, AppPassword, GrantExecuteToApp, DefaultAdminPasswordHash)
VALUES (0, N'Vtuber_admin', N'ChangeMe!123!', 1, N'$2b$12$LQv3c1yqBwEHxv03kpOFQudZL7vw0QvYGKcMfhPGYm8hgP1HxKRv2');

PRINT '--- Fox Shrine VTuber Setup Script ---';
PRINT 'Target database: [Vtuber_Website]';

IF DB_ID(N'Vtuber_Website') IS NULL
BEGIN
    THROW 50001, 'Database Vtuber_Website does not exist. Create it before running this script.', 1;
END;

DECLARE @CreateAppLogin BIT;
DECLARE @AppLogin SYSNAME;
DECLARE @AppPassword NVARCHAR(128);

SELECT
    @CreateAppLogin = CreateAppLogin,
    @AppLogin = AppLogin,
    @AppPassword = AppPassword
FROM #SetupOptions;

IF @CreateAppLogin = 1
BEGIN
    IF EXISTS (SELECT 1 FROM sys.sql_logins WHERE name = @AppLogin)
    BEGIN
        PRINT 'Login ' + QUOTENAME(@AppLogin) + ' already exists. Skipping creation.';
    END
    ELSE
    BEGIN
        DECLARE @createLoginSql NVARCHAR(MAX) =
            N'CREATE LOGIN ' + QUOTENAME(@AppLogin) +
            N' WITH PASSWORD = N''' + REPLACE(@AppPassword, '''', '''''') +
            N''', CHECK_POLICY = ON, CHECK_EXPIRATION = ON;';
        EXEC (@createLoginSql);
        PRINT 'Created SQL login ' + QUOTENAME(@AppLogin) + '.';
    END
END
ELSE
BEGIN
    PRINT 'CreateAppLogin flag is 0. Login provisioning skipped.';
END;
GO

USE [Vtuber_Website];
GO

SET NOCOUNT ON;
PRINT 'Ensuring core tables exist...';

IF OBJECT_ID(N'dbo.Configuration', N'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[Configuration] (
        [Id] INT IDENTITY(1,1) PRIMARY KEY,
        [Key] NVARCHAR(100) NOT NULL UNIQUE,
        [Value] NVARCHAR(MAX) NOT NULL,
        [Category] NVARCHAR(50) NOT NULL DEFAULT 'general',
        [Description] NVARCHAR(500) NULL,
        [IsActive] BIT NOT NULL DEFAULT 1,
        [CreatedAt] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        [UpdatedAt] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        [CreatedBy] NVARCHAR(200) NOT NULL DEFAULT 'system',
        [UpdatedBy] NVARCHAR(200) NOT NULL DEFAULT 'system'
    );
    PRINT 'Created table dbo.Configuration';
END;

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_Configuration_Key_Active' AND object_id = OBJECT_ID(N'dbo.Configuration'))
BEGIN
    CREATE INDEX IX_Configuration_Key_Active ON dbo.Configuration ([Key], [IsActive]);
END;

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_Configuration_Category' AND object_id = OBJECT_ID(N'dbo.Configuration'))
BEGIN
    CREATE INDEX IX_Configuration_Category ON dbo.Configuration ([Category]);
END;

IF OBJECT_ID(N'dbo.ConfigurationAudit', N'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[ConfigurationAudit] (
        [Id] INT IDENTITY(1,1) PRIMARY KEY,
        [ConfigurationId] INT NULL,
        [Action] NVARCHAR(20) NOT NULL,
        [OldValue] NVARCHAR(MAX) NULL,
        [NewValue] NVARCHAR(MAX) NULL,
        [ChangedBy] NVARCHAR(100) NOT NULL,
        [ChangedAt] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        [IPAddress] NVARCHAR(45) NULL,
        [UserAgent] NVARCHAR(500) NULL
    );
    PRINT 'Created table dbo.ConfigurationAudit';
END;

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_ConfigurationAudit_ConfigId_Date' AND object_id = OBJECT_ID(N'dbo.ConfigurationAudit'))
BEGIN
    CREATE INDEX IX_ConfigurationAudit_ConfigId_Date ON dbo.ConfigurationAudit ([ConfigurationId], [ChangedAt]);
END;

IF OBJECT_ID(N'dbo.Roles', N'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[Roles] (
        [Id] INT IDENTITY(1,1) PRIMARY KEY,
        [Name] NVARCHAR(50) NOT NULL UNIQUE,
        [Description] NVARCHAR(255) NULL,
        [IsActive] BIT NOT NULL DEFAULT 1,
        [CreatedAt] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        [UpdatedAt] DATETIME2 NOT NULL DEFAULT GETUTCDATE()
    );
    PRINT 'Created table dbo.Roles';
END;

IF OBJECT_ID(N'dbo.Users', N'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[Users] (
        [Id] INT IDENTITY(1,1) PRIMARY KEY,
        [Username] NVARCHAR(100) NOT NULL UNIQUE,
        [Email] NVARCHAR(510) NOT NULL UNIQUE,
        [PasswordHash] NVARCHAR(510) NOT NULL,
        [DisplayName] NVARCHAR(200) NULL,
        [Avatar] NVARCHAR(1000) NULL,
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
        [CreatedBy] NVARCHAR(200) NOT NULL DEFAULT 'system',
        CONSTRAINT FK_Users_Roles FOREIGN KEY ([RoleId]) REFERENCES [dbo].[Roles]([Id])
    );
    PRINT 'Created table dbo.Users';
END;

IF OBJECT_ID(N'dbo.Permissions', N'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[Permissions] (
        [Id] INT IDENTITY(1,1) PRIMARY KEY,
        [Name] NVARCHAR(100) NOT NULL UNIQUE,
        [Description] NVARCHAR(255) NULL,
        [Category] NVARCHAR(50) NOT NULL DEFAULT 'general',
        [IsActive] BIT NOT NULL DEFAULT 1,
        [CreatedAt] DATETIME2 NOT NULL DEFAULT GETUTCDATE()
    );
    PRINT 'Created table dbo.Permissions';
END;

IF OBJECT_ID(N'dbo.RolePermissions', N'U') IS NULL
BEGIN
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
    PRINT 'Created table dbo.RolePermissions';
END;

IF OBJECT_ID(N'dbo.UserSessions', N'U') IS NULL
BEGIN
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
    PRINT 'Created table dbo.UserSessions';
END;

IF OBJECT_ID(N'dbo.UserActivityLog', N'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[UserActivityLog] (
        [Id] INT IDENTITY(1,1) PRIMARY KEY,
        [UserId] INT NULL,
        [Action] NVARCHAR(100) NOT NULL,
        [Details] NVARCHAR(MAX) NULL,
        [IPAddress] NVARCHAR(45) NULL,
        [UserAgent] NVARCHAR(500) NULL,
        [Timestamp] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        [SessionId] INT NULL,
        CONSTRAINT FK_UserActivityLog_Users FOREIGN KEY ([UserId]) REFERENCES [dbo].[Users]([Id]),
        CONSTRAINT FK_UserActivityLog_Sessions FOREIGN KEY ([SessionId]) REFERENCES [dbo].[UserSessions]([Id])
    );
    PRINT 'Created table dbo.UserActivityLog';
END;

IF COL_LENGTH('dbo.ConfigurationAudit', 'IPAddress') IS NULL
BEGIN
    ALTER TABLE dbo.ConfigurationAudit ADD [IPAddress] NVARCHAR(45) NULL;
    PRINT 'Ensured dbo.ConfigurationAudit.IPAddress column exists.';
END;

IF COL_LENGTH('dbo.ConfigurationAudit', 'UserAgent') IS NULL
BEGIN
    ALTER TABLE dbo.ConfigurationAudit ADD [UserAgent] NVARCHAR(500) NULL;
    PRINT 'Ensured dbo.ConfigurationAudit.UserAgent column exists.';
END;

IF COL_LENGTH('dbo.Users', 'LoginAttempts') IS NULL
BEGIN
    ALTER TABLE dbo.Users ADD [LoginAttempts] INT NOT NULL DEFAULT 0 WITH VALUES;
    PRINT 'Ensured dbo.Users.LoginAttempts column exists.';
END;

IF COL_LENGTH('dbo.Users', 'LockedUntil') IS NULL
BEGIN
    ALTER TABLE dbo.Users ADD [LockedUntil] DATETIME2 NULL;
    PRINT 'Ensured dbo.Users.LockedUntil column exists.';
END;

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_Users_Email' AND object_id = OBJECT_ID(N'dbo.Users'))
BEGIN
    CREATE INDEX IX_Users_Email ON dbo.Users ([Email]);
END;
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_Users_Username' AND object_id = OBJECT_ID(N'dbo.Users'))
BEGIN
    CREATE INDEX IX_Users_Username ON dbo.Users ([Username]);
END;
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_Users_Role_Active' AND object_id = OBJECT_ID(N'dbo.Users'))
BEGIN
    CREATE INDEX IX_Users_Role_Active ON dbo.Users ([RoleId], [IsActive]);
END;
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_Users_LastLogin' AND object_id = OBJECT_ID(N'dbo.Users'))
BEGIN
    CREATE INDEX IX_Users_LastLogin ON dbo.Users ([LastLoginAt]);
END;

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_UserSessions_User_Active' AND object_id = OBJECT_ID(N'dbo.UserSessions'))
BEGIN
    CREATE INDEX IX_UserSessions_User_Active ON dbo.UserSessions ([UserId], [IsActive]);
END;
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_UserSessions_Token' AND object_id = OBJECT_ID(N'dbo.UserSessions'))
BEGIN
    CREATE INDEX IX_UserSessions_Token ON dbo.UserSessions ([SessionToken]);
END;
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_UserSessions_Refresh' AND object_id = OBJECT_ID(N'dbo.UserSessions'))
BEGIN
    CREATE INDEX IX_UserSessions_Refresh ON dbo.UserSessions ([RefreshToken]);
END;
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_UserSessions_Expires' AND object_id = OBJECT_ID(N'dbo.UserSessions'))
BEGIN
    CREATE INDEX IX_UserSessions_Expires ON dbo.UserSessions ([ExpiresAt]);
END;

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_UserActivityLog_User_Timestamp' AND object_id = OBJECT_ID(N'dbo.UserActivityLog'))
BEGIN
    CREATE INDEX IX_UserActivityLog_User_Timestamp ON dbo.UserActivityLog ([UserId], [Timestamp]);
END;
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_UserActivityLog_Action' AND object_id = OBJECT_ID(N'dbo.UserActivityLog'))
BEGIN
    CREATE INDEX IX_UserActivityLog_Action ON dbo.UserActivityLog ([Action]);
END;
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_UserActivityLog_Timestamp' AND object_id = OBJECT_ID(N'dbo.UserActivityLog'))
BEGIN
    CREATE INDEX IX_UserActivityLog_Timestamp ON dbo.UserActivityLog ([Timestamp]);
END;

IF OBJECT_ID(N'dbo.Configuration', N'U') IS NOT NULL
BEGIN
    PRINT 'Reconciling dbo.Configuration column requirements...';

    IF COL_LENGTH('dbo.Configuration', 'Category') IS NULL
    BEGIN
        ALTER TABLE dbo.Configuration ADD [Category] NVARCHAR(50) NOT NULL CONSTRAINT DF_Configuration_Category DEFAULT 'general' WITH VALUES;
        PRINT 'Ensured dbo.Configuration.Category column exists.';
    END
    ELSE
    BEGIN
        UPDATE dbo.Configuration SET Category = 'general' WHERE Category IS NULL;
    END;

    IF COL_LENGTH('dbo.Configuration', 'Description') IS NULL
    BEGIN
        ALTER TABLE dbo.Configuration ADD [Description] NVARCHAR(500) NULL;
        PRINT 'Ensured dbo.Configuration.Description column exists.';
    END;

    IF COL_LENGTH('dbo.Configuration', 'IsActive') IS NULL
    BEGIN
        ALTER TABLE dbo.Configuration ADD [IsActive] BIT NOT NULL CONSTRAINT DF_Configuration_IsActive DEFAULT 1 WITH VALUES;
        PRINT 'Ensured dbo.Configuration.IsActive column exists.';
    END
    ELSE
    BEGIN
        UPDATE dbo.Configuration SET IsActive = 1 WHERE IsActive IS NULL;
    END;

    IF COL_LENGTH('dbo.Configuration', 'CreatedAt') IS NULL
    BEGIN
        ALTER TABLE dbo.Configuration ADD [CreatedAt] DATETIME2 NOT NULL CONSTRAINT DF_Configuration_CreatedAt DEFAULT GETUTCDATE() WITH VALUES;
        PRINT 'Ensured dbo.Configuration.CreatedAt column exists.';
    END
    ELSE
    BEGIN
        UPDATE dbo.Configuration SET CreatedAt = ISNULL(CreatedAt, GETUTCDATE());
    END;

    IF COL_LENGTH('dbo.Configuration', 'UpdatedAt') IS NULL
    BEGIN
        ALTER TABLE dbo.Configuration ADD [UpdatedAt] DATETIME2 NOT NULL CONSTRAINT DF_Configuration_UpdatedAt DEFAULT GETUTCDATE() WITH VALUES;
        PRINT 'Ensured dbo.Configuration.UpdatedAt column exists.';
    END
    ELSE
    BEGIN
        UPDATE dbo.Configuration SET UpdatedAt = ISNULL(UpdatedAt, GETUTCDATE());
    END;

    IF COL_LENGTH('dbo.Configuration', 'CreatedBy') IS NULL
    BEGIN
        ALTER TABLE dbo.Configuration ADD [CreatedBy] NVARCHAR(200) NOT NULL CONSTRAINT DF_Configuration_CreatedBy DEFAULT 'system' WITH VALUES;
        PRINT 'Ensured dbo.Configuration.CreatedBy column exists.';
    END
    ELSE IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID(N'dbo.Configuration') AND name = 'CreatedBy' AND max_length < 400)
    BEGIN
        ALTER TABLE dbo.Configuration ALTER COLUMN [CreatedBy] NVARCHAR(200) NOT NULL;
        PRINT 'Expanded dbo.Configuration.CreatedBy to NVARCHAR(200).';
    END;

    IF COL_LENGTH('dbo.Configuration', 'CreatedBy') IS NOT NULL
    BEGIN
        UPDATE dbo.Configuration SET CreatedBy = 'system' WHERE CreatedBy IS NULL;
    END;

    IF COL_LENGTH('dbo.Configuration', 'UpdatedBy') IS NULL
    BEGIN
        ALTER TABLE dbo.Configuration ADD [UpdatedBy] NVARCHAR(200) NOT NULL CONSTRAINT DF_Configuration_UpdatedBy DEFAULT 'system' WITH VALUES;
        PRINT 'Ensured dbo.Configuration.UpdatedBy column exists.';
    END
    ELSE
    BEGIN
        IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID(N'dbo.Configuration') AND name = 'UpdatedBy' AND max_length < 400)
        BEGIN
            ALTER TABLE dbo.Configuration ALTER COLUMN [UpdatedBy] NVARCHAR(200) NOT NULL;
            PRINT 'Expanded dbo.Configuration.UpdatedBy to NVARCHAR(200).';
        END;
        UPDATE dbo.Configuration SET UpdatedBy = 'system' WHERE UpdatedBy IS NULL;
    END;
END;

IF OBJECT_ID(N'dbo.Users', N'U') IS NOT NULL
BEGIN
    PRINT 'Reconciling dbo.Users column lengths...';

    IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID(N'dbo.Users') AND name = 'Username' AND max_length < 200)
    BEGIN
        ALTER TABLE dbo.Users ALTER COLUMN [Username] NVARCHAR(100) NOT NULL;
        PRINT 'Expanded dbo.Users.Username to NVARCHAR(100).';
    END;

    IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID(N'dbo.Users') AND name = 'Email' AND max_length < 1020)
    BEGIN
        ALTER TABLE dbo.Users ALTER COLUMN [Email] NVARCHAR(510) NOT NULL;
        PRINT 'Expanded dbo.Users.Email to NVARCHAR(510).';
    END;

    IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID(N'dbo.Users') AND name = 'PasswordHash' AND max_length < 1020)
    BEGIN
        ALTER TABLE dbo.Users ALTER COLUMN [PasswordHash] NVARCHAR(510) NOT NULL;
        PRINT 'Expanded dbo.Users.PasswordHash to NVARCHAR(510).';
    END;

    IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID(N'dbo.Users') AND name = 'DisplayName' AND max_length < 400)
    BEGIN
        ALTER TABLE dbo.Users ALTER COLUMN [DisplayName] NVARCHAR(200) NULL;
        PRINT 'Expanded dbo.Users.DisplayName to NVARCHAR(200).';
    END;

    IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID(N'dbo.Users') AND name = 'Avatar' AND max_length < 2000)
    BEGIN
        ALTER TABLE dbo.Users ALTER COLUMN [Avatar] NVARCHAR(1000) NULL;
        PRINT 'Expanded dbo.Users.Avatar to NVARCHAR(1000).';
    END;

    IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID(N'dbo.Users') AND name = 'CreatedBy' AND max_length < 400)
    BEGIN
        ALTER TABLE dbo.Users ALTER COLUMN [CreatedBy] NVARCHAR(200) NOT NULL;
        PRINT 'Expanded dbo.Users.CreatedBy to NVARCHAR(200).';
    END;

    IF COL_LENGTH('dbo.Users', 'CreatedBy') IS NOT NULL
    BEGIN
        UPDATE dbo.Users SET CreatedBy = 'system' WHERE CreatedBy IS NULL;
    END;
END;
GO

PRINT 'Ensuring triggers exist...';
GO

CREATE OR ALTER TRIGGER dbo.TR_Configuration_UpdatedAt
ON dbo.Configuration
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE c
    SET UpdatedAt = GETUTCDATE()
    FROM dbo.Configuration AS c
    INNER JOIN inserted AS i ON c.Id = i.Id;
END;
GO

CREATE OR ALTER TRIGGER dbo.TR_Configuration_Audit
ON dbo.Configuration
AFTER INSERT, UPDATE, DELETE
AS
BEGIN
    SET NOCOUNT ON;

    IF EXISTS (SELECT 1 FROM inserted) AND NOT EXISTS (SELECT 1 FROM deleted)
    BEGIN
        INSERT INTO dbo.ConfigurationAudit (ConfigurationId, Action, NewValue, ChangedBy)
        SELECT Id, 'INSERT', Value, UpdatedBy
        FROM inserted;
    END;

    IF EXISTS (SELECT 1 FROM inserted) AND EXISTS (SELECT 1 FROM deleted)
    BEGIN
        INSERT INTO dbo.ConfigurationAudit (ConfigurationId, Action, OldValue, NewValue, ChangedBy)
        SELECT i.Id, 'UPDATE', d.Value, i.Value, i.UpdatedBy
        FROM inserted AS i
        INNER JOIN deleted AS d ON i.Id = d.Id
        WHERE ISNULL(i.Value, '') <> ISNULL(d.Value, '');
    END;

    IF EXISTS (SELECT 1 FROM deleted) AND NOT EXISTS (SELECT 1 FROM inserted)
    BEGIN
        INSERT INTO dbo.ConfigurationAudit (ConfigurationId, Action, OldValue, ChangedBy)
        SELECT Id, 'DELETE', Value, 'system'
        FROM deleted;
    END;
END;
GO

CREATE OR ALTER TRIGGER dbo.TR_Users_UpdatedAt
ON dbo.Users
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE u
    SET UpdatedAt = GETUTCDATE()
    FROM dbo.Users AS u
    INNER JOIN inserted AS i ON u.Id = i.Id;
END;
GO

CREATE OR ALTER TRIGGER dbo.TR_Roles_UpdatedAt
ON dbo.Roles
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE r
    SET UpdatedAt = GETUTCDATE()
    FROM dbo.Roles AS r
    INNER JOIN inserted AS i ON r.Id = i.Id;
END;
GO

PRINT 'Creating or updating stored procedures...';
GO

CREATE OR ALTER PROCEDURE dbo.GetActiveConfiguration
AS
BEGIN
    SET NOCOUNT ON;
    SELECT [Key], [Value], [Category], [Description], [UpdatedAt]
    FROM dbo.Configuration
    WHERE IsActive = 1
    ORDER BY [Category], [Key];
END;
GO

CREATE OR ALTER PROCEDURE dbo.GetConfigurationByCategory
    @Category NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;
    SELECT [Key], [Value], [Category], [Description], [UpdatedAt]
    FROM dbo.Configuration
    WHERE IsActive = 1 AND [Category] = @Category
    ORDER BY [Key];
END;
GO

CREATE OR ALTER PROCEDURE dbo.UpsertConfiguration
    @Key NVARCHAR(100),
    @Value NVARCHAR(MAX),
    @Category NVARCHAR(50) = 'general',
    @Description NVARCHAR(500) = NULL,
    @UpdatedBy NVARCHAR(100) = 'api'
AS
BEGIN
    SET NOCOUNT ON;

    IF EXISTS (SELECT 1 FROM dbo.Configuration WHERE [Key] = @Key)
    BEGIN
        UPDATE dbo.Configuration
        SET [Value] = @Value,
            [Category] = @Category,
            [Description] = COALESCE(@Description, [Description]),
            [UpdatedBy] = @UpdatedBy,
            [IsActive] = 1
        WHERE [Key] = @Key;
    END
    ELSE
    BEGIN
        INSERT INTO dbo.Configuration ([Key], [Value], [Category], [Description], [CreatedBy], [UpdatedBy])
        VALUES (@Key, @Value, @Category, @Description, @UpdatedBy, @UpdatedBy);
    END;

    SELECT [Key], [Value], [Category], [Description], [UpdatedAt]
    FROM dbo.Configuration
    WHERE [Key] = @Key;
END;
GO

CREATE OR ALTER PROCEDURE dbo.GetConfigurationAudit
    @ConfigurationKey NVARCHAR(100) = NULL,
    @Days INT = 30
AS
BEGIN
    SET NOCOUNT ON;

    SELECT ca.Action, ca.OldValue, ca.NewValue, ca.ChangedBy, ca.ChangedAt, ca.IPAddress, ca.UserAgent,
           c.[Key], c.[Category]
    FROM dbo.ConfigurationAudit AS ca
    LEFT JOIN dbo.Configuration AS c ON ca.ConfigurationId = c.Id
    WHERE ca.ChangedAt >= DATEADD(DAY, -@Days, GETUTCDATE())
      AND (@ConfigurationKey IS NULL OR c.[Key] = @ConfigurationKey)
    ORDER BY ca.ChangedAt DESC;
END;
GO

CREATE OR ALTER PROCEDURE dbo.GetUserWithPermissions
    @Username NVARCHAR(50) = NULL,
    @Email NVARCHAR(255) = NULL,
    @UserId INT = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        u.Id, u.Username, u.Email, u.DisplayName, u.Avatar,
        u.IsActive, u.IsEmailVerified, u.LastLoginAt, u.CreatedAt,
        r.Name AS RoleName, r.Description AS RoleDescription,
        STRING_AGG(p.Name, ',') AS Permissions
    FROM dbo.Users AS u
    INNER JOIN dbo.Roles AS r ON u.RoleId = r.Id
    LEFT JOIN dbo.RolePermissions AS rp ON r.Id = rp.RoleId
    LEFT JOIN dbo.Permissions AS p ON rp.PermissionId = p.Id AND p.IsActive = 1
    WHERE u.IsActive = 1
      AND (@Username IS NULL OR u.Username = @Username)
      AND (@Email IS NULL OR u.Email = @Email)
      AND (@UserId IS NULL OR u.Id = @UserId)
    GROUP BY u.Id, u.Username, u.Email, u.DisplayName, u.Avatar,
             u.IsActive, u.IsEmailVerified, u.LastLoginAt, u.CreatedAt,
             r.Name, r.Description;
END;
GO

CREATE OR ALTER PROCEDURE dbo.CreateUser
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

    SELECT @RoleId = Id FROM dbo.Roles WHERE Name = @RoleName AND IsActive = 1;

    IF @RoleId IS NULL
    BEGIN
        RAISERROR('Invalid role specified', 16, 1);
        RETURN;
    END;

    INSERT INTO dbo.Users (Username, Email, PasswordHash, DisplayName, RoleId, CreatedBy)
    VALUES (@Username, @Email, @PasswordHash, @DisplayName, @RoleId, @CreatedBy);

    SET @UserId = SCOPE_IDENTITY();

    EXEC dbo.GetUserWithPermissions @UserId = @UserId;
END;
GO

CREATE OR ALTER PROCEDURE dbo.UpdateUserRole
    @UserId INT,
    @RoleName NVARCHAR(50),
    @UpdatedBy NVARCHAR(100) = 'system'
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @RoleId INT;

    SELECT @RoleId = Id FROM dbo.Roles WHERE Name = @RoleName AND IsActive = 1;

    IF @RoleId IS NULL
    BEGIN
        RAISERROR('Invalid role specified', 16, 1);
        RETURN;
    END;

    UPDATE dbo.Users
    SET RoleId = @RoleId, UpdatedAt = GETUTCDATE()
    WHERE Id = @UserId AND IsActive = 1;

    INSERT INTO dbo.UserActivityLog (UserId, Action, Details)
    VALUES (@UserId, 'ROLE_UPDATED', CONCAT('Role changed to: ', @RoleName, ' by: ', @UpdatedBy));

    EXEC dbo.GetUserWithPermissions @UserId = @UserId;
END;
GO

CREATE OR ALTER PROCEDURE dbo.CheckUserPermission
    @UserId INT,
    @Permission NVARCHAR(100)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT CASE WHEN COUNT(*) > 0 THEN 1 ELSE 0 END AS HasPermission
    FROM dbo.Users AS u
    INNER JOIN dbo.Roles AS r ON u.RoleId = r.Id
    INNER JOIN dbo.RolePermissions AS rp ON r.Id = rp.RoleId
    INNER JOIN dbo.Permissions AS p ON rp.PermissionId = p.Id
    WHERE u.Id = @UserId
      AND u.IsActive = 1
      AND r.IsActive = 1
      AND p.IsActive = 1
      AND p.Name = @Permission;
END;
GO

CREATE OR ALTER PROCEDURE dbo.GetRolesWithPermissions
AS
BEGIN
    SET NOCOUNT ON;

    SELECT r.Id, r.Name, r.Description, r.IsActive, r.CreatedAt,
           STRING_AGG(p.Name, ',') AS Permissions,
           COUNT(p.Id) AS PermissionCount
    FROM dbo.Roles AS r
    LEFT JOIN dbo.RolePermissions AS rp ON r.Id = rp.RoleId
    LEFT JOIN dbo.Permissions AS p ON rp.PermissionId = p.Id AND p.IsActive = 1
    WHERE r.IsActive = 1
    GROUP BY r.Id, r.Name, r.Description, r.IsActive, r.CreatedAt
    ORDER BY r.Name;
END;
GO

CREATE OR ALTER PROCEDURE dbo.LogUserActivity
    @UserId INT = NULL,
    @Action NVARCHAR(100),
    @Details NVARCHAR(MAX) = NULL,
    @IPAddress NVARCHAR(45) = NULL,
    @UserAgent NVARCHAR(500) = NULL,
    @SessionId INT = NULL
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO dbo.UserActivityLog (UserId, Action, Details, IPAddress, UserAgent, SessionId)
    VALUES (@UserId, @Action, @Details, @IPAddress, @UserAgent, @SessionId);
END;
GO

CREATE OR ALTER PROCEDURE dbo.CleanExpiredSessions
AS
BEGIN
    SET NOCOUNT ON;

    DELETE FROM dbo.UserSessions
    WHERE ExpiresAt < GETUTCDATE() OR IsActive = 0;

    SELECT @@ROWCOUNT AS DeletedSessions;
END;
GO

PRINT 'Seeding configuration data (inserting missing keys)...';
DECLARE @ConfigurationSeed TABLE (
    [Key] NVARCHAR(100) PRIMARY KEY,
    [Value] NVARCHAR(MAX),
    [Category] NVARCHAR(50),
    [Description] NVARCHAR(500)
);

INSERT INTO @ConfigurationSeed ([Key], [Value], [Category], [Description])
VALUES
(N'siteTitle', N'Fox Shrine VTuber', N'site', N'Main website title'),
(N'siteDescription', N'Join the Fox Shrine for games, laughs, and shrine fox adventures!', N'site', N'Website meta description'),
(N'siteLogo', N'/images/fox-shrine-logo.png', N'site', N'Site logo path'),
(N'siteUrl', N'https://foxshrinevtuber.com', N'site', N'Main website URL'),
(N'characterName', N'Fox Shrine Guardian', N'character', N'VTuber character name'),
(N'characterDescription', N'A mischievous fox spirit who guards an ancient shrine and streams for fun!', N'character', N'Character description'),
(N'characterImage', N'/images/fox-character.png', N'character', N'Main character image'),
(N'characterGreeting', N'Welcome to my shrine, fellow foxes! 🦊', N'character', N'Character greeting message'),
(N'twitchUrl', N'https://twitch.tv/foxshrinevtuber', N'social', N'Twitch channel URL'),
(N'youtubeUrl', N'https://youtube.com/@foxshrinevtuber', N'social', N'YouTube channel URL'),
(N'twitterUrl', N'https://twitter.com/foxshrinevtuber', N'social', N'Twitter profile URL'),
(N'discordUrl', N'https://discord.gg/foxshrine', N'social', N'Discord server invite'),
(N'instagramUrl', N'https://instagram.com/foxshrinevtuber', N'social', N'Instagram profile URL'),
(N'streamTitle', N'Fox Friday Funtime!', N'stream', N'Current stream title'),
(N'streamCategory', N'Just Chatting', N'stream', N'Current stream category'),
(N'isLive', N'false', N'stream', N'Is currently streaming'),
(N'nextStreamDate', N'2025-09-15T21:00:00Z', N'stream', N'Next scheduled stream'),
(N'streamNotification', N'Join me tonight for some cozy games! 🎮', N'stream', N'Stream announcement'),
(N'primaryColor', N'#C41E3A', N'theme', N'Primary theme color (shrine red)'),
(N'secondaryColor', N'#FF9500', N'theme', N'Secondary theme color (fox orange)'),
(N'accentColor', N'#5FB4A2', N'theme', N'Accent theme color (shrine teal)'),
(N'backgroundColor', N'#F5F1E8', N'theme', N'Background color (shrine white)'),
(N'fontFamily', N'Cinzel, serif', N'theme', N'Primary font family'),
(N'showMerch', N'true', N'features', N'Show merchandise section'),
(N'showDonations', N'true', N'features', N'Show donation/support section'),
(N'showSchedule', N'true', N'features', N'Show stream schedule'),
(N'showLatestVideos', N'true', N'features', N'Show latest videos section'),
(N'enableNotifications', N'true', N'features', N'Enable browser notifications'),
(N'heroTitle', N'Welcome to the Fox Shrine', N'content', N'Hero section title'),
(N'heroSubtitle', N'Join me on a magical journey filled with laughter, games, and shrine fox mischief!', N'content', N'Hero section subtitle'),
(N'aboutText', N'Legend has it that I was once a regular fox who stumbled upon an abandoned shrine deep in the mystical forest. After years of guarding it and absorbing its magical energy, I gained the ability to take human form and connect with the human world!', N'content', N'About section text'),
(N'businessEmail', N'business@foxshrinevtuber.com', N'contact', N'Business inquiries email'),
(N'fanEmail', N'fanart@foxshrinevtuber.com', N'contact', N'Fan art submissions email'),
(N'supportEmail', N'support@foxshrinevtuber.com', N'contact', N'Technical support email'),
(N'googleAnalyticsId', N'', N'analytics', N'Google Analytics tracking ID'),
(N'enableAnalytics', N'false', N'analytics', N'Enable analytics tracking'),
(N'maintenanceMode', N'false', N'system', N'Enable maintenance mode'),
(N'maintenanceMessage', N'The shrine is currently under magical maintenance! Please check back soon! 🦊✨', N'system', N'Maintenance mode message'),
(N'emergencyNotice', N'', N'system', N'Emergency notice to display site-wide'),
(N'latestStreamEmbedUrl', N'https://www.youtube.com/embed/dQw4w9WgXcQ', N'stream', N'YouTube/Twitch embed URL for Latest Stream'),
(N'latestVideos', N'[
    {"id":"1","title":"Forest Spirit Adventure - Part 1","thumbnail":"/thumbnails/video1.jpg","views":"12K","date":"2 days ago","duration":"2:34:17","url":"https://www.youtube.com/watch?v=forest-adventure"},
    {"id":"2","title":"Chat & Chill: Ask Me Anything!","thumbnail":"/thumbnails/video2.jpg","views":"8.5K","date":"5 days ago","duration":"1:47:22","url":"https://www.youtube.com/watch?v=chat-chill-ama"},
    {"id":"3","title":"Scary Games Night (I was so brave!)","thumbnail":"/thumbnails/video3.jpg","views":"15K","date":"1 week ago","duration":"3:12:45","url":"https://www.youtube.com/watch?v=scary-games-night"}
  ]', N'content', N'Homepage Latest Videos grid'),
(N'schedule', N'[
    {"day":"Monday","time":"7:00 PM - 10:00 PM","title":"Chatting & Games","description":"Starting the week with chill vibes and fun games","icon":"🎮"},
    {"day":"Wednesday","time":"8:00 PM - 11:00 PM","title":"Adventure Games","description":"Join the journey through mysterious worlds","icon":"🗺️"},
    {"day":"Friday","time":"9:00 PM - 12:00 AM","title":"Fox Friday Funtime","description":"End the week with maximum silliness and games","icon":"🦊"},
    {"day":"Sunday","time":"3:00 PM - 7:00 PM","title":"Shrine Stories","description":"Relax with shrine tales and community time","icon":"⛩️"}
  ]', N'content', N'Homepage schedule cards'),
(N'merch', N'[
    {"id":"m1","name":"Fox Plushie","image":"/merch/plushie.jpg","price":"$24.99","isNew":true,"url":"https://shop.foxshrinevtuber.com/plushie"},
    {"id":"m2","name":"Shrine Hoodie","image":"/merch/hoodie.jpg","price":"$49.99","isNew":false,"url":"https://shop.foxshrinevtuber.com/hoodie"},
    {"id":"m3","name":"Magical Fox Mug","image":"/merch/mug.jpg","price":"$18.99","isNew":false,"url":"https://shop.foxshrinevtuber.com/mug"},
    {"id":"m4","name":"Limited Edition Pin Set","image":"/merch/pins.jpg","price":"$15.99","isNew":true,"url":"https://shop.foxshrinevtuber.com/pins"}
  ]', N'content', N'Homepage merch showcase');

MERGE dbo.Configuration AS target
USING @ConfigurationSeed AS source
ON target.[Key] = source.[Key]
WHEN MATCHED THEN
    UPDATE SET
        target.Category = source.Category,
        target.Description = COALESCE(source.Description, target.Description),
        target.IsActive = 1,
        target.UpdatedBy = 'setup-script'
WHEN NOT MATCHED THEN
    INSERT ([Key], [Value], [Category], [Description], [CreatedBy], [UpdatedBy], [IsActive])
    VALUES (source.[Key], source.[Value], source.[Category], source.[Description], 'setup-script', 'setup-script', 1);

PRINT 'Configuration seeds applied.';
GO

PRINT 'Seeding roles and permissions...';

DECLARE @Roles TABLE (Name NVARCHAR(50), Description NVARCHAR(255));
INSERT INTO @Roles (Name, Description)
VALUES
(N'Super Admin', N'Full system access with all permissions'),
(N'Admin', N'Administrative access to manage website content and users'),
(N'Moderator', N'Limited administrative access for content moderation'),
(N'VIP', N'VIP members with special privileges'),
(N'Member', N'Registered members with basic privileges'),
(N'Guest', N'Anonymous users with read-only access');

MERGE dbo.Roles AS target
USING @Roles AS source
ON target.Name = source.Name
WHEN MATCHED THEN
    UPDATE SET target.Description = source.Description, target.IsActive = 1
WHEN NOT MATCHED THEN
    INSERT (Name, Description, IsActive)
    VALUES (source.Name, source.Description, 1);

DECLARE @Permissions TABLE (Name NVARCHAR(100), Description NVARCHAR(255), Category NVARCHAR(50));
INSERT INTO @Permissions (Name, Description, Category)
VALUES
(N'config.read', N'View website configuration', N'configuration'),
(N'config.write', N'Modify website configuration', N'configuration'),
(N'config.delete', N'Delete configuration entries', N'configuration'),
(N'config.audit', N'View configuration audit logs', N'configuration'),
(N'stream.read', N'View stream information', N'stream'),
(N'stream.write', N'Update stream status and information', N'stream'),
(N'stream.schedule', N'Manage stream schedule', N'stream'),
(N'stream.notifications', N'Send stream notifications', N'stream'),
(N'content.read', N'View website content', N'content'),
(N'content.write', N'Create and edit content', N'content'),
(N'content.delete', N'Delete content', N'content'),
(N'content.publish', N'Publish/unpublish content', N'content'),
(N'users.read', N'View user information', N'users'),
(N'users.write', N'Create and edit users', N'users'),
(N'users.delete', N'Delete users', N'users'),
(N'users.roles', N'Manage user roles and permissions', N'users'),
(N'users.sessions', N'Manage user sessions', N'users'),
(N'analytics.read', N'View website analytics', N'analytics'),
(N'logs.read', N'View system logs', N'logs'),
(N'logs.export', N'Export log data', N'logs'),
(N'system.maintenance', N'Enable/disable maintenance mode', N'system'),
(N'system.backup', N'Perform system backups', N'system'),
(N'system.settings', N'Modify system settings', N'system'),
(N'social.read', N'View social media settings', N'social'),
(N'social.write', N'Update social media links and content', N'social'),
(N'merch.read', N'View merchandise information', N'merchandise'),
(N'merch.write', N'Manage merchandise listings', N'merchandise'),
(N'merch.orders', N'View and manage orders', N'merchandise'),
(N'community.read', N'View community features', N'community'),
(N'community.moderate', N'Moderate community content', N'community'),
(N'community.ban', N'Ban/unban community members', N'community');

MERGE dbo.Permissions AS target
USING @Permissions AS source
ON target.Name = source.Name
WHEN MATCHED THEN
    UPDATE SET target.Description = source.Description, target.Category = source.Category, target.IsActive = 1
WHEN NOT MATCHED THEN
    INSERT (Name, Description, Category, IsActive)
    VALUES (source.Name, source.Description, source.Category, 1);

;WITH RoleLookup AS (
    SELECT Id, Name
    FROM dbo.Roles
),
PermissionLookup AS (
    SELECT Id, Name
    FROM dbo.Permissions
),
RolePermissionSeed AS (
    SELECT rl.Id AS RoleId, pl.Id AS PermissionId, 'system' AS GrantedBy
    FROM RoleLookup AS rl
    JOIN PermissionLookup AS pl ON 1 = 1
    WHERE rl.Name = 'Super Admin'
    UNION ALL
    SELECT rl.Id, pl.Id, 'system'
    FROM RoleLookup AS rl
    JOIN PermissionLookup AS pl ON 1 = 1
    WHERE rl.Name = 'Admin'
      AND pl.Name NOT IN (N'users.delete', N'system.backup', N'logs.export')
    UNION ALL
    SELECT rl.Id, pl.Id, 'system'
    FROM RoleLookup AS rl
    JOIN PermissionLookup AS pl ON pl.Name IN (N'config.read', N'stream.read', N'content.read', N'content.write', N'content.publish',
                                               N'community.read', N'community.moderate', N'social.read', N'merch.read',
                                               N'analytics.read', N'logs.read')
    WHERE rl.Name = 'Moderator'
    UNION ALL
    SELECT rl.Id, pl.Id, 'system'
    FROM RoleLookup AS rl
    JOIN PermissionLookup AS pl ON pl.Name IN (N'config.read', N'stream.read', N'content.read', N'community.read', N'social.read', N'merch.read', N'analytics.read')
    WHERE rl.Name = 'VIP'
    UNION ALL
    SELECT rl.Id, pl.Id, 'system'
    FROM RoleLookup AS rl
    JOIN PermissionLookup AS pl ON pl.Name IN (N'config.read', N'stream.read', N'content.read', N'community.read', N'social.read', N'merch.read')
    WHERE rl.Name = 'Member'
    UNION ALL
    SELECT rl.Id, pl.Id, 'system'
    FROM RoleLookup AS rl
    JOIN PermissionLookup AS pl ON pl.Name IN (N'config.read', N'stream.read', N'content.read', N'social.read', N'merch.read')
    WHERE rl.Name = 'Guest'
)
INSERT INTO dbo.RolePermissions (RoleId, PermissionId, GrantedAt, GrantedBy)
SELECT DISTINCT seed.RoleId, seed.PermissionId, GETUTCDATE(), seed.GrantedBy
FROM RolePermissionSeed AS seed
WHERE NOT EXISTS (
    SELECT 1
    FROM dbo.RolePermissions AS existing
    WHERE existing.RoleId = seed.RoleId
      AND existing.PermissionId = seed.PermissionId
);

PRINT 'Roles and permissions seeded.';
GO

PRINT 'Ensuring default admin user exists...';
DECLARE @DefaultAdminPasswordHash NVARCHAR(255);
SELECT @DefaultAdminPasswordHash = DefaultAdminPasswordHash FROM #SetupOptions;
DECLARE @SuperAdminId INT = (SELECT TOP 1 Id FROM dbo.Roles WHERE Name = 'Super Admin');
IF @SuperAdminId IS NULL
BEGIN
    RAISERROR('Super Admin role not found. Aborting admin user creation.', 16, 1);
END
ELSE
BEGIN
    IF EXISTS (SELECT 1 FROM dbo.Users WHERE Username = 'foxadmin')
    BEGIN
        UPDATE dbo.Users
        SET PasswordHash = @DefaultAdminPasswordHash,
            RoleId = @SuperAdminId,
            IsActive = 1,
            IsEmailVerified = 1,
            LoginAttempts = 0,
            LockedUntil = NULL,
            UpdatedAt = GETUTCDATE()
        WHERE Username = 'foxadmin';
        PRINT 'Updated existing foxadmin account.';
    END
    ELSE
    BEGIN
        INSERT INTO dbo.Users (Username, Email, PasswordHash, DisplayName, RoleId, IsActive, IsEmailVerified, CreatedBy)
        VALUES (
            'foxadmin',
            'admin@foxshrinevtuber.com',
            @DefaultAdminPasswordHash,
            'Fox Shrine Admin',
            @SuperAdminId,
            1,
            1,
            'system'
        );
        PRINT 'Created default foxadmin account.';
    END
END;
GO

PRINT 'Optional: Creating database user and granting permissions...';
DECLARE @CreateAppLogin BIT;
DECLARE @AppLogin SYSNAME;
DECLARE @GrantExecuteToApp BIT;

SELECT
    @CreateAppLogin = CreateAppLogin,
    @AppLogin = AppLogin,
    @GrantExecuteToApp = GrantExecuteToApp
FROM #SetupOptions;

IF @CreateAppLogin = 1
BEGIN
    IF NOT EXISTS (SELECT 1 FROM sys.database_principals WHERE name = @AppLogin)
    BEGIN
        DECLARE @createUserSql NVARCHAR(MAX) = N'CREATE USER ' + QUOTENAME(@AppLogin) + N' FOR LOGIN ' + QUOTENAME(@AppLogin) + N';';
        EXEC (@createUserSql);
        PRINT 'Created database user ' + QUOTENAME(@AppLogin) + '.';
    END
    ELSE
    BEGIN
        PRINT 'Database user ' + QUOTENAME(@AppLogin) + ' already exists.';
    END

    IF NOT EXISTS (
        SELECT 1
        FROM sys.database_role_members drm
        JOIN sys.database_principals dpRole ON drm.role_principal_id = dpRole.principal_id
        JOIN sys.database_principals dpUser ON drm.member_principal_id = dpUser.principal_id
        WHERE dpRole.name = N'db_datareader' AND dpUser.name = @AppLogin
    )
    BEGIN
        DECLARE @readerSql NVARCHAR(MAX) = N'ALTER ROLE db_datareader ADD MEMBER ' + QUOTENAME(@AppLogin) + N';';
        EXEC (@readerSql);
    END

    IF NOT EXISTS (
        SELECT 1
        FROM sys.database_role_members drm
        JOIN sys.database_principals dpRole ON drm.role_principal_id = dpRole.principal_id
        JOIN sys.database_principals dpUser ON drm.member_principal_id = dpUser.principal_id
        WHERE dpRole.name = N'db_datawriter' AND dpUser.name = @AppLogin
    )
    BEGIN
        DECLARE @writerSql NVARCHAR(MAX) = N'ALTER ROLE db_datawriter ADD MEMBER ' + QUOTENAME(@AppLogin) + N';';
        EXEC (@writerSql);
    END

    IF @GrantExecuteToApp = 1
    BEGIN
        DECLARE @grantSql NVARCHAR(MAX) = N'GRANT EXECUTE ON SCHEMA::dbo TO ' + QUOTENAME(@AppLogin) + N';';
        EXEC (@grantSql);
    END
END
ELSE
BEGIN
    PRINT 'CreateAppLogin flag is 0. Skipping database user grants.';
END;

DROP TABLE #SetupOptions;
GO

PRINT 'Fox Shrine VTuber setup script completed successfully.';
GO
