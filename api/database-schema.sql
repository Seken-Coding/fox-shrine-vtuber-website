-- Fox Shrine VTuber Website Database Schema
-- Azure SQL Database: Vtuber_Website

-- Create Configuration table for dynamic website settings
CREATE TABLE [dbo].[Configuration] (
    [Id] INT IDENTITY(1,1) PRIMARY KEY,
    [Key] NVARCHAR(100) NOT NULL UNIQUE,
    [Value] NVARCHAR(MAX) NOT NULL,
    [Category] NVARCHAR(50) NOT NULL DEFAULT 'general',
    [Description] NVARCHAR(500) NULL,
    [IsActive] BIT NOT NULL DEFAULT 1,
    [CreatedAt] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    [UpdatedAt] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    [CreatedBy] NVARCHAR(100) NOT NULL DEFAULT 'system',
    [UpdatedBy] NVARCHAR(100) NOT NULL DEFAULT 'system'
);

-- Create index for fast key lookups
CREATE INDEX IX_Configuration_Key_Active ON [dbo].[Configuration] ([Key], [IsActive]);
CREATE INDEX IX_Configuration_Category ON [dbo].[Configuration] ([Category]);

-- Create Audit Log table for tracking changes
CREATE TABLE [dbo].[ConfigurationAudit] (
    [Id] INT IDENTITY(1,1) PRIMARY KEY,
    [ConfigurationId] INT NULL,
    [Action] NVARCHAR(20) NOT NULL, -- INSERT, UPDATE, DELETE
    [OldValue] NVARCHAR(MAX) NULL,
    [NewValue] NVARCHAR(MAX) NULL,
    [ChangedBy] NVARCHAR(100) NOT NULL,
    [ChangedAt] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    [IPAddress] NVARCHAR(45) NULL,
    [UserAgent] NVARCHAR(500) NULL
);

-- Create index for audit queries
CREATE INDEX IX_ConfigurationAudit_ConfigId_Date ON [dbo].[ConfigurationAudit] ([ConfigurationId], [ChangedAt]);

-- Insert default VTuber website configuration
INSERT INTO [dbo].[Configuration] ([Key], [Value], [Category], [Description]) VALUES
-- Site Information
('siteTitle', 'Fox Shrine VTuber', 'site', 'Main website title'),
('siteDescription', 'Join the Fox Shrine for games, laughs, and shrine fox adventures!', 'site', 'Website meta description'),
('siteLogo', '/images/fox-shrine-logo.png', 'site', 'Site logo path'),
('siteUrl', 'https://foxshrinevtuber.com', 'site', 'Main website URL'),

-- Character Information
('characterName', 'Fox Shrine Guardian', 'character', 'VTuber character name'),
('characterDescription', 'A mischievous fox spirit who guards an ancient shrine and streams for fun!', 'character', 'Character description'),
('characterImage', '/images/fox-character.png', 'character', 'Main character image'),
('characterGreeting', 'Welcome to my shrine, fellow foxes! 🦊', 'character', 'Character greeting message'),

-- Social Media Links
('twitchUrl', 'https://twitch.tv/foxshrinevtuber', 'social', 'Twitch channel URL'),
('youtubeUrl', 'https://youtube.com/@foxshrinevtuber', 'social', 'YouTube channel URL'),
('twitterUrl', 'https://twitter.com/foxshrinevtuber', 'social', 'Twitter profile URL'),
('discordUrl', 'https://discord.gg/foxshrine', 'social', 'Discord server invite'),
('instagramUrl', 'https://instagram.com/foxshrinevtuber', 'social', 'Instagram profile URL'),

-- Stream Settings
('streamTitle', 'Fox Friday Funtime!', 'stream', 'Current stream title'),
('streamCategory', 'Just Chatting', 'stream', 'Current stream category'),
('isLive', 'false', 'stream', 'Is currently streaming'),
('nextStreamDate', '2025-09-15T21:00:00Z', 'stream', 'Next scheduled stream'),
('streamNotification', 'Join me tonight for some cozy games! 🎮', 'stream', 'Stream announcement'),

-- Theme Settings
('primaryColor', '#C41E3A', 'theme', 'Primary theme color (shrine red)'),
('secondaryColor', '#FF9500', 'theme', 'Secondary theme color (fox orange)'),
('accentColor', '#5FB4A2', 'theme', 'Accent theme color (shrine teal)'),
('backgroundColor', '#F5F1E8', 'theme', 'Background color (shrine white)'),
('fontFamily', 'Cinzel, serif', 'theme', 'Primary font family'),

-- Features Toggle
('showMerch', 'true', 'features', 'Show merchandise section'),
('showDonations', 'true', 'features', 'Show donation/support section'),
('showSchedule', 'true', 'features', 'Show stream schedule'),
('showLatestVideos', 'true', 'features', 'Show latest videos section'),
('enableNotifications', 'true', 'features', 'Enable browser notifications'),

-- Content Settings
('heroTitle', 'Welcome to the Fox Shrine', 'content', 'Hero section title'),
('heroSubtitle', 'Join me on a magical journey filled with laughter, games, and shrine fox mischief!', 'content', 'Hero section subtitle'),
('aboutText', 'Legend has it that I was once a regular fox who stumbled upon an abandoned shrine deep in the mystical forest. After years of guarding it and absorbing its magical energy, I gained the ability to take human form and connect with the human world!', 'content', 'About section text'),

-- Contact Information
('businessEmail', 'business@foxshrinevtuber.com', 'contact', 'Business inquiries email'),
('fanEmail', 'fanart@foxshrinevtuber.com', 'contact', 'Fan art submissions email'),
('supportEmail', 'support@foxshrinevtuber.com', 'contact', 'Technical support email'),

-- Analytics
('googleAnalyticsId', '', 'analytics', 'Google Analytics tracking ID'),
('enableAnalytics', 'false', 'analytics', 'Enable analytics tracking'),

-- Emergency Settings
('maintenanceMode', 'false', 'system', 'Enable maintenance mode'),
('maintenanceMessage', 'The shrine is currently under magical maintenance! Please check back soon! 🦊✨', 'system', 'Maintenance mode message'),
('emergencyNotice', '', 'system', 'Emergency notice to display site-wide');

-- Create trigger for automatic UpdatedAt timestamp
CREATE TRIGGER TR_Configuration_UpdatedAt
ON [dbo].[Configuration]
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE [dbo].[Configuration]
    SET [UpdatedAt] = GETUTCDATE()
    WHERE [Id] IN (SELECT DISTINCT [Id] FROM INSERTED);
END;

-- Create trigger for audit logging
CREATE TRIGGER TR_Configuration_Audit
ON [dbo].[Configuration]
AFTER INSERT, UPDATE, DELETE
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Handle INSERT
    IF EXISTS (SELECT * FROM INSERTED) AND NOT EXISTS (SELECT * FROM DELETED)
    BEGIN
        INSERT INTO [dbo].[ConfigurationAudit] ([ConfigurationId], [Action], [NewValue], [ChangedBy])
        SELECT [Id], 'INSERT', [Value], [UpdatedBy]
        FROM INSERTED;
    END
    
    -- Handle UPDATE
    IF EXISTS (SELECT * FROM INSERTED) AND EXISTS (SELECT * FROM DELETED)
    BEGIN
        INSERT INTO [dbo].[ConfigurationAudit] ([ConfigurationId], [Action], [OldValue], [NewValue], [ChangedBy])
        SELECT i.[Id], 'UPDATE', d.[Value], i.[Value], i.[UpdatedBy]
        FROM INSERTED i
        INNER JOIN DELETED d ON i.[Id] = d.[Id]
        WHERE i.[Value] != d.[Value];
    END
    
    -- Handle DELETE
    IF EXISTS (SELECT * FROM DELETED) AND NOT EXISTS (SELECT * FROM INSERTED)
    BEGIN
        INSERT INTO [dbo].[ConfigurationAudit] ([ConfigurationId], [Action], [OldValue], [ChangedBy])
        SELECT [Id], 'DELETE', [Value], 'system'
        FROM DELETED;
    END
END;

-- Create stored procedures for common operations

-- Get all active configuration
CREATE PROCEDURE [dbo].[GetActiveConfiguration]
AS
BEGIN
    SET NOCOUNT ON;
    SELECT [Key], [Value], [Category], [Description], [UpdatedAt]
    FROM [dbo].[Configuration]
    WHERE [IsActive] = 1
    ORDER BY [Category], [Key];
END;

-- Get configuration by category
CREATE PROCEDURE [dbo].[GetConfigurationByCategory]
    @Category NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;
    SELECT [Key], [Value], [Category], [Description], [UpdatedAt]
    FROM [dbo].[Configuration]
    WHERE [IsActive] = 1 AND [Category] = @Category
    ORDER BY [Key];
END;

-- Update or insert configuration
CREATE PROCEDURE [dbo].[UpsertConfiguration]
    @Key NVARCHAR(100),
    @Value NVARCHAR(MAX),
    @Category NVARCHAR(50) = 'general',
    @Description NVARCHAR(500) = NULL,
    @UpdatedBy NVARCHAR(100) = 'api'
AS
BEGIN
    SET NOCOUNT ON;
    
    IF EXISTS (SELECT 1 FROM [dbo].[Configuration] WHERE [Key] = @Key)
    BEGIN
        UPDATE [dbo].[Configuration]
        SET [Value] = @Value,
            [Category] = @Category,
            [Description] = COALESCE(@Description, [Description]),
            [UpdatedBy] = @UpdatedBy,
            [IsActive] = 1
        WHERE [Key] = @Key;
    END
    ELSE
    BEGIN
        INSERT INTO [dbo].[Configuration] ([Key], [Value], [Category], [Description], [CreatedBy], [UpdatedBy])
        VALUES (@Key, @Value, @Category, @Description, @UpdatedBy, @UpdatedBy);
    END
    
    SELECT [Key], [Value], [Category], [Description], [UpdatedAt]
    FROM [dbo].[Configuration]
    WHERE [Key] = @Key;
END;

-- Get configuration audit trail
CREATE PROCEDURE [dbo].[GetConfigurationAudit]
    @ConfigurationKey NVARCHAR(100) = NULL,
    @Days INT = 30
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT ca.[Action], ca.[OldValue], ca.[NewValue], ca.[ChangedBy], ca.[ChangedAt], ca.[IPAddress],
           c.[Key], c.[Category]
    FROM [dbo].[ConfigurationAudit] ca
    LEFT JOIN [dbo].[Configuration] c ON ca.[ConfigurationId] = c.[Id]
    WHERE ca.[ChangedAt] >= DATEADD(DAY, -@Days, GETUTCDATE())
        AND (@ConfigurationKey IS NULL OR c.[Key] = @ConfigurationKey)
    ORDER BY ca.[ChangedAt] DESC;
END;
