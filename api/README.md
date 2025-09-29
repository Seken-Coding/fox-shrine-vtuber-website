# Fox Shrine VTuber API

## CORS configuration

Set allowed origins with an environment variable and redeploy:

- CORS_ORIGINS: comma-separated list of origins (protocol + host), for example:
  - https://foxshrinevtuber.com,https://www.foxshrinevtuber.com,https://mei-satsuki.net,https://www.mei-satsuki.net
- LOG_CORS: set to `true` to print the computed allowlist during startup for troubleshooting.

Notes:
- CORS is registered before the rate limiter and handles preflight (OPTIONS) with 204.
- Origins are normalized (lowercased, no trailing slash) before comparison.
- Disallowed origins won’t throw; CORS headers will simply be absent.

## Security & proxy
- Helmet sets sensible security headers; CSP connectSrc is environment-aware.
- app.set('trust proxy', 1) so Render/X-Forwarded-* headers provide the real client IP for rate limits and logs.

## Configuration API and SQL
- GET /api/config returns a nested JSON object, with flat legacy keys mapped into dot-notation (e.g., `twitchUrl` → `social.twitchUrl`).
- Values are parsed into proper types: JSON arrays/objects, booleans, and numbers.
- PUT /api/config/:key accepts nested keys; objects/arrays are stringified into JSON before storage.

### Seed content
Option A: Run the SQL file directly (`seed-content-config.sql`) against your database.

Option B (recommended): Use the helper script via npm.

- Ensure DB_* are set in `.env` in this folder (see `.env.example`).
- Run: `npm run seed:content`

This will execute `seed-content-config.sql` and populate:
- stream.latestStreamEmbedUrl
- content.latestVideos
- content.schedule
- content.merch
- social.* URLs

Verification:
- Call GET `/api/config` and check that `data.content.latestVideos`, `data.content.schedule`, `data.content.merch`, and `data.stream.latestStreamEmbedUrl` are populated.

## Environment
- NODE_ENV, JWT_SECRET (required in production), DB_* for Azure SQL connection, CORS_ORIGINS, LOG_CORS.
