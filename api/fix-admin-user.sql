-- Fix foxadmin user password and unlock account
-- Run this script as database administrator

-- First, let's see what columns exist in the Users table
SELECT COLUMN_NAME, DATA_TYPE 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'Users'
ORDER BY ORDINAL_POSITION;

-- Add missing columns if they don't exist
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Users' AND COLUMN_NAME = 'LoginAttempts')
BEGIN
    ALTER TABLE dbo.Users ADD LoginAttempts INT DEFAULT 0;
    PRINT 'Added LoginAttempts column';
END

IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Users' AND COLUMN_NAME = 'LockedUntil')
BEGIN
    ALTER TABLE dbo.Users ADD LockedUntil DATETIME2 NULL;
    PRINT 'Added LockedUntil column';
END

-- Update the password hash for foxadmin with the correct hash and unlock account
UPDATE dbo.Users 
SET PasswordHash = '$2b$12$mr7fKRzleW5TiZTWO6v27e10G3TQnswqYXr37ywXh0kNE0ZxRxsba',
    LoginAttempts = 0,
    LockedUntil = NULL,
    UpdatedAt = GETUTCDATE()
WHERE Username = 'foxadmin';

PRINT 'Updated foxadmin password and unlocked account';

-- Verify the user exists and is active
SELECT Username, Email, DisplayName, IsActive, LoginAttempts, LockedUntil
FROM dbo.Users 
WHERE Username = 'foxadmin';
