-- Seed JSON-based content configuration for homepage sections
-- Requires stored procedure [dbo].[UpsertConfiguration] to exist

-- Latest Stream embed URL
EXEC [dbo].[UpsertConfiguration]
  @Key = 'latestStreamEmbedUrl',
  @Value = 'https://www.youtube.com/embed/dQw4w9WgXcQ',
  @Category = 'stream',
  @Description = 'YouTube/Twitch embed URL for Latest Stream',
  @UpdatedBy = 'seed-script';

-- Latest Videos (JSON array)
EXEC [dbo].[UpsertConfiguration]
  @Key = 'latestVideos',
  @Value = N'[
    {"id":"1","title":"Forest Spirit Adventure - Part 1","thumbnail":"/thumbnails/video1.jpg","views":"12K","date":"2 days ago","duration":"2:34:17","url":"https://www.youtube.com/watch?v=forest-adventure"},
    {"id":"2","title":"Chat & Chill: Ask Me Anything!","thumbnail":"/thumbnails/video2.jpg","views":"8.5K","date":"5 days ago","duration":"1:47:22","url":"https://www.youtube.com/watch?v=chat-chill-ama"},
    {"id":"3","title":"Scary Games Night (I was so brave!)","thumbnail":"/thumbnails/video3.jpg","views":"15K","date":"1 week ago","duration":"3:12:45","url":"https://www.youtube.com/watch?v=scary-games-night"}
  ]',
  @Category = 'content',
  @Description = 'Homepage Latest Videos grid',
  @UpdatedBy = 'seed-script';

-- Schedule (JSON array)
EXEC [dbo].[UpsertConfiguration]
  @Key = 'schedule',
  @Value = N'[
    {"day":"Monday","time":"7:00 PM - 10:00 PM","title":"Chatting & Games","description":"Starting the week with chill vibes and fun games","icon":"🎮"},
    {"day":"Wednesday","time":"8:00 PM - 11:00 PM","title":"Adventure Games","description":"Join the journey through mysterious worlds","icon":"🗺️"},
    {"day":"Friday","time":"9:00 PM - 12:00 AM","title":"Fox Friday Funtime","description":"End the week with maximum silliness and games","icon":"🦊"},
    {"day":"Sunday","time":"3:00 PM - 7:00 PM","title":"Shrine Stories","description":"Relax with shrine tales and community time","icon":"⛩️"}
  ]',
  @Category = 'content',
  @Description = 'Homepage schedule cards',
  @UpdatedBy = 'seed-script';

-- Merch (JSON array)
EXEC [dbo].[UpsertConfiguration]
  @Key = 'merch',
  @Value = N'[
    {"id":"m1","name":"Fox Plushie","image":"/merch/plushie.jpg","price":"$24.99","isNew":true,"url":"https://shop.foxshrinevtuber.com/plushie"},
    {"id":"m2","name":"Shrine Hoodie","image":"/merch/hoodie.jpg","price":"$49.99","isNew":false,"url":"https://shop.foxshrinevtuber.com/hoodie"},
    {"id":"m3","name":"Magical Fox Mug","image":"/merch/mug.jpg","price":"$18.99","isNew":false,"url":"https://shop.foxshrinevtuber.com/mug"},
    {"id":"m4","name":"Limited Edition Pin Set","image":"/merch/pins.jpg","price":"$15.99","isNew":true,"url":"https://shop.foxshrinevtuber.com/pins"}
  ]',
  @Category = 'content',
  @Description = 'Homepage merch showcase',
  @UpdatedBy = 'seed-script';

-- Social links (flat keys map to nested on API)
EXEC [dbo].[UpsertConfiguration] @Key='twitchUrl',   @Value='https://twitch.tv/foxshrinevtuber',     @Category='social', @Description='Twitch',   @UpdatedBy='seed-script';
EXEC [dbo].[UpsertConfiguration] @Key='youtubeUrl',  @Value='https://youtube.com/@foxshrinevtuber',  @Category='social', @Description='YouTube',  @UpdatedBy='seed-script';
EXEC [dbo].[UpsertConfiguration] @Key='twitterUrl',  @Value='https://twitter.com/foxshrinevtuber',   @Category='social', @Description='Twitter',  @UpdatedBy='seed-script';
EXEC [dbo].[UpsertConfiguration] @Key='discordUrl',  @Value='https://discord.gg/foxshrine',          @Category='social', @Description='Discord',  @UpdatedBy='seed-script';
EXEC [dbo].[UpsertConfiguration] @Key='instagramUrl',@Value='https://instagram.com/foxshrinevtuber', @Category='social', @Description='Instagram',@UpdatedBy='seed-script';
