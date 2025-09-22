-- Grant permissions to Vtuber_admin user for Fox Shrine VTuber API
-- Run this script as a database administrator (like the server admin)

-- Grant db_datareader and db_datawriter roles to Vtuber_admin
ALTER ROLE db_datareader ADD MEMBER [Vtuber_admin];
ALTER ROLE db_datawriter ADD MEMBER [Vtuber_admin];

-- Grant execute permissions for stored procedures
GRANT EXECUTE ON SCHEMA::dbo TO [Vtuber_admin];

-- Grant specific permissions on all tables
GRANT SELECT, INSERT, UPDATE, DELETE ON dbo.Users TO [Vtuber_admin];
GRANT SELECT, INSERT, UPDATE, DELETE ON dbo.Roles TO [Vtuber_admin];
GRANT SELECT, INSERT, UPDATE, DELETE ON dbo.Permissions TO [Vtuber_admin];
-- UserRoles table does not exist in current schema; roles are linked via Users.RoleId
GRANT SELECT, INSERT, UPDATE, DELETE ON dbo.RolePermissions TO [Vtuber_admin];
GRANT SELECT, INSERT, UPDATE, DELETE ON dbo.UserSessions TO [Vtuber_admin];
GRANT SELECT, INSERT, UPDATE, DELETE ON dbo.ActivityLogs TO [Vtuber_admin];

-- Grant permissions on stored procedures
GRANT EXECUTE ON dbo.CreateUser TO [Vtuber_admin];
GRANT EXECUTE ON dbo.GetUserWithPermissions TO [Vtuber_admin];
GRANT EXECUTE ON dbo.LogUserActivity TO [Vtuber_admin];
GRANT EXECUTE ON dbo.CleanExpiredSessions TO [Vtuber_admin];

PRINT 'Permissions granted successfully to Vtuber_admin user';

-- Create the default admin user if it doesn't exist
-- This needs to be run with elevated permissions
IF NOT EXISTS (SELECT 1 FROM dbo.Users WHERE Username = 'foxadmin')
BEGIN
    -- Insert the default admin user with hashed password
    -- Password: FoxShrine2025! (hashed with bcrypt)
    INSERT INTO dbo.Users (Username, Email, PasswordHash, DisplayName, IsActive, CreatedAt, UpdatedAt)
    VALUES (
        'foxadmin',
        'admin@foxshrine.com',
        '$2b$12$LQv3c4yqdyOTFuGJ6le2l.oAXOSw9L8YgKjM9rQHn8kOo1Xz1qrDi', -- FoxShrine2025!
        'Fox Shrine Admin',
        1,
        GETUTCDATE(),
        GETUTCDATE()
    );
    
    -- Get the inserted user ID
    DECLARE @AdminUserId INT = SCOPE_IDENTITY();
    
    -- Assign Super Admin role (ID = 1)
    UPDATE dbo.Users SET RoleId = 1 WHERE Id = @AdminUserId;
    
    PRINT 'Default admin user "foxadmin" created successfully';
END
ELSE
BEGIN
    PRINT 'Default admin user "foxadmin" already exists';
END;
