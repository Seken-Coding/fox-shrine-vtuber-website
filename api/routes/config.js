const express = require('express');
const { getPool, sql } = require('../db');
const {
  authenticateToken,
  optionalAuth,
  requirePermission,
} = require('../middleware/auth');
const { validate, bulkConfigSchema } = require('../middleware/validation');
const { logAuditTrail } = require('../utils/audit');

const router = express.Router();

const legacyKeyMap = {
  siteTitle: 'siteTitle',
  siteDescription: 'siteDescription',
  siteLogo: 'siteLogo',
  siteUrl: 'siteUrl',
  characterName: 'character.name',
  characterDescription: 'character.description',
  characterImage: 'character.image',
  characterGreeting: 'character.greeting',
  twitchUrl: 'social.twitchUrl',
  youtubeUrl: 'social.youtubeUrl',
  twitterUrl: 'social.twitterUrl',
  discordUrl: 'social.discordUrl',
  instagramUrl: 'social.instagramUrl',
  streamTitle: 'stream.title',
  streamCategory: 'stream.category',
  isLive: 'stream.isLive',
  nextStreamDate: 'stream.nextStreamDate',
  streamNotification: 'stream.notification',
  latestStreamEmbedUrl: 'stream.latestStreamEmbedUrl',
  primaryColor: 'theme.primaryColor',
  secondaryColor: 'theme.secondaryColor',
  accentColor: 'theme.accentColor',
  backgroundColor: 'theme.backgroundColor',
  fontFamily: 'theme.fontFamily',
  showMerch: 'features.showMerch',
  showDonations: 'features.showDonations',
  showSchedule: 'features.showSchedule',
  showLatestVideos: 'features.showLatestVideos',
  enableNotifications: 'features.enableNotifications',
  heroTitle: 'content.heroTitle',
  heroSubtitle: 'content.heroSubtitle',
  aboutText: 'content.aboutText',
  latestVideos: 'content.latestVideos',
  schedule: 'content.schedule',
  merch: 'content.merch',
  businessEmail: 'contact.businessEmail',
  fanEmail: 'contact.fanEmail',
  supportEmail: 'contact.supportEmail',
  googleAnalyticsId: 'analytics.googleAnalyticsId',
  enableAnalytics: 'analytics.enableAnalytics',
  maintenanceMode: 'system.maintenanceMode',
  maintenanceMessage: 'system.maintenanceMessage',
  emergencyNotice: 'system.emergencyNotice',
};

const mapKey = (key) => {
  if (!key || key.includes('.')) return key;
  return legacyKeyMap[key] || key;
};

const parseConfigValue = (value) => {
  if (value === null || value === undefined) return value;
  if (typeof value !== 'string') return value;

  const trimmed = value.trim();

  if (
    (trimmed.startsWith('{') && trimmed.endsWith('}')) ||
    (trimmed.startsWith('[') && trimmed.endsWith(']'))
  ) {
    try {
      return JSON.parse(trimmed);
    } catch (error) {
      return value;
    }
  }

  if (/^(true|false)$/i.test(trimmed)) {
    return /^true$/i.test(trimmed);
  }

  if (/^-?\d+(?:\.\d+)?$/.test(trimmed)) {
    const numberValue = Number(trimmed);
    if (Number.isFinite(numberValue)) {
      return numberValue;
    }
  }

  return value;
};

const buildConfigObject = (records) => {
  const config = {};

  records.forEach((row) => {
    const key = mapKey(row.Key);
    const segments = key.split('.');
    let cursor = config;

    for (let i = 0; i < segments.length - 1; i += 1) {
      if (!cursor[segments[i]]) {
        cursor[segments[i]] = {};
      }
      cursor = cursor[segments[i]];
    }

    cursor[segments[segments.length - 1]] = parseConfigValue(row.Value);
  });

  return config;
};

router.get('/', optionalAuth, async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request().execute('GetActiveConfiguration');
    const config = buildConfigObject(result.recordset);

    if (req.user) {
      await pool
        .request()
        .input('UserId', sql.Int, req.user.id)
        .input('Action', sql.NVarChar(100), 'CONFIG_READ')
        .input('Details', sql.NVarChar(sql.MAX), 'Read all configuration')
        .input('IPAddress', sql.NVarChar(45), req.ip)
        .input('UserAgent', sql.NVarChar(500), req.get('User-Agent') || '')
        .execute('LogUserActivity');
    }

    res.json({
      success: true,
      data: config,
      timestamp: new Date().toISOString(),
      count: result.recordset.length,
      user: req.user ? { role: req.user.role, username: req.user.username } : null,
    });
  } catch (error) {
    console.error('Config fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch configuration',
      message: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

router.get('/:category', optionalAuth, async (req, res) => {
  try {
    const { category } = req.params;
    const pool = await getPool();

    const result = await pool
      .request()
      .input('Category', sql.NVarChar(50), category)
      .execute('GetConfigurationByCategory');

    res.json({
      success: true,
      data: buildConfigObject(result.recordset),
      category,
      timestamp: new Date().toISOString(),
      count: result.recordset.length,
    });
  } catch (error) {
    console.error('Config category fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch configuration by category',
      message: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

router.put(
  '/:key',
  authenticateToken,
  requirePermission('config.write'),
  async (req, res) => {
    try {
      const { key } = req.params;
      const { value, category = 'general', description } = req.body;

      if (value === undefined) {
        return res.status(400).json({
          success: false,
          error: 'Value is required',
          timestamp: new Date().toISOString(),
        });
      }

      const pool = await getPool();
      const serialized =
        value !== null && typeof value === 'object' ? JSON.stringify(value) : String(value);

      const result = await pool
        .request()
        .input('Key', sql.NVarChar(100), key)
        .input('Value', sql.NVarChar(sql.MAX), serialized)
        .input('Category', sql.NVarChar(50), category)
        .input('Description', sql.NVarChar(500), description)
        .input('UpdatedBy', sql.NVarChar(100), req.user.username || req.ip || 'api')
        .execute('UpsertConfiguration');

      await logAuditTrail(req, 'UPDATE_CONFIG', `Updated ${key} = ${value}`);

      await pool
        .request()
        .input('UserId', sql.Int, req.user.id)
        .input('Action', sql.NVarChar(100), 'CONFIG_UPDATE')
        .input('Details', sql.NVarChar(sql.MAX), `Updated ${key}`)
        .input('IPAddress', sql.NVarChar(45), req.ip)
        .input('UserAgent', sql.NVarChar(500), req.get('User-Agent') || '')
        .execute('LogUserActivity');

      res.json({
        success: true,
        data: result.recordset[0],
        message: 'Configuration updated successfully',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Config update error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update configuration',
        message: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  }
);

router.put(
  '/',
  authenticateToken,
  requirePermission('config.write'),
  validate(bulkConfigSchema),
  async (req, res) => {
    try {
      const { configs } = req.body;

      if (!Array.isArray(configs)) {
        return res.status(400).json({
          success: false,
          error: 'configs must be an array',
          timestamp: new Date().toISOString(),
        });
      }

      const pool = await getPool();
      const results = [];

      for (const config of configs) {
        const { key, value, category = 'general', description } = config;

        if (!key || value === undefined) {
          // skip invalid entries silently to match previous behaviour
          // eslint-disable-next-line no-continue
          continue;
        }

        const serialized =
          value !== null && typeof value === 'object' ? JSON.stringify(value) : String(value);

        const result = await pool
          .request()
          .input('Key', sql.NVarChar(100), key)
          .input('Value', sql.NVarChar(sql.MAX), serialized)
          .input('Category', sql.NVarChar(50), category)
          .input('Description', sql.NVarChar(500), description)
          .input('UpdatedBy', sql.NVarChar(100), req.user.username || 'api')
          .execute('UpsertConfiguration');

        results.push(result.recordset[0]);
      }

      await pool
        .request()
        .input('UserId', sql.Int, req.user.id)
        .input('Action', sql.NVarChar(100), 'CONFIG_BULK_UPDATE')
        .input('Details', sql.NVarChar(sql.MAX), `Updated ${results.length} configurations`)
        .input('IPAddress', sql.NVarChar(45), req.ip)
        .input('UserAgent', sql.NVarChar(500), req.get('User-Agent') || '')
        .execute('LogUserActivity');

      res.json({
        success: true,
        data: results,
        message: `Updated ${results.length} configurations successfully`,
        timestamp: new Date().toISOString(),
        count: results.length,
      });
    } catch (error) {
      console.error('Bulk config update error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update configurations',
        message: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  }
);

router.delete(
  '/:key',
  authenticateToken,
  requirePermission('config.delete'),
  async (req, res) => {
    try {
      const { key } = req.params;
      const pool = await getPool();

      const result = await pool
        .request()
        .input('Key', sql.NVarChar(100), key)
        .input('UpdatedBy', sql.NVarChar(100), req.user.username || 'api')
        .query(`
          UPDATE Configuration
          SET IsActive = 0, UpdatedBy = @UpdatedBy, UpdatedAt = GETUTCDATE()
          OUTPUT DELETED.Key, DELETED.Value, DELETED.Category
          WHERE [Key] = @Key AND IsActive = 1
        `);

      if (result.recordset.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Configuration not found',
        });
      }

      await logAuditTrail(req, 'DELETE_CONFIG', `Deleted ${result.recordset[0].Key}`);

      res.json({
        success: true,
        message: 'Configuration deleted successfully',
        data: result.recordset[0],
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Delete config error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete configuration',
        message: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  }
);

module.exports = router;
