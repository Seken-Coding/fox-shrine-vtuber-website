/*
    Fox Shrine VTuber - Configuration Content Update Script
    ------------------------------------------------------
    This script centralizes every configurable homepage/content key stored in dbo.Configuration.
    Edit the VALUES block below with your desired content, then execute the whole script in SSMS.
    The script relies on dbo.UpsertConfiguration provided by setup-database.sql.
*/

USE [Vtuber_Website];
GO

SET NOCOUNT ON;

DECLARE @RunLabel NVARCHAR(100) = 'content-update-script';
DECLARE @Now DATETIME2 = SYSDATETIME();

DECLARE @ConfigurationUpdates TABLE
(
    [Key] NVARCHAR(100) PRIMARY KEY,
    [Value] NVARCHAR(MAX),
    [Category] NVARCHAR(50),
    [Description] NVARCHAR(500)
);

INSERT INTO @ConfigurationUpdates ([Key], [Value], [Category], [Description])
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

DECLARE @Rows INT;

MERGE dbo.Configuration AS target
USING @ConfigurationUpdates AS source
    ON target.[Key] = source.[Key]
WHEN MATCHED THEN
    UPDATE SET
        target.[Value] = source.[Value],
        target.[Category] = source.[Category],
        target.[Description] = source.[Description],
        target.[IsActive] = 1,
        target.[UpdatedBy] = @RunLabel
WHEN NOT MATCHED THEN
    INSERT ([Key], [Value], [Category], [Description], [CreatedBy], [UpdatedBy], [IsActive])
    VALUES (source.[Key], source.[Value], source.[Category], source.[Description], @RunLabel, @RunLabel, 1);

SET @Rows = @@ROWCOUNT;

PRINT CONCAT('Configuration rows affected: ', @Rows);

SELECT c.[Key], c.[Value], c.[Category], c.[Description], c.[UpdatedAt]
FROM dbo.Configuration AS c
WHERE c.[Key] IN (SELECT [Key] FROM @ConfigurationUpdates)
ORDER BY c.[Key];
GO
