# Fox Shrine VTuber Website

Full-stack project with a React SPA (`fox-shrine-vtuber/`) and an Express API (`api/`) backed by Azure SQL. The homepage sections (latest stream, schedule, latest videos, merch, social links) are driven by data in the Configuration table.

## Prerequisites
- Node.js 20.x
- An Azure SQL database (or SQL Server-compatible)
- Windows PowerShell (commands below use PS syntax)

## Quick start

1) Install dependencies
- Frontend:
  - In `fox-shrine-vtuber/`: `npm ci`
- API:
  - In `api/`: `npm ci`

2) Configure API env
- Copy `api/.env.example` to `api/.env` and set:
  - DB_SERVER, DB_NAME, DB_USER, DB_PASSWORD
  - JWT_SECRET (strong secret in prod)
  - CORS_ORIGINS: include your site domains (no trailing slashes)
  - LOG_CORS=true (optional for troubleshooting)

3) Start API and SPA
- API: from `api/`: `npm run dev` (or `npm start`)
- SPA: from `fox-shrine-vtuber/`: `npm start`
- Local URLs:
  - API: http://localhost:3002/api
  - SPA: http://localhost:3000

4) Seed content config (recommended)
- From `api/`: `npm run seed:content`
- This executes `seed-content-config.sql` and populates:
  - `stream.latestStreamEmbedUrl`
  - `content.latestVideos`
  - `content.schedule`
  - `content.merch`
  - `social.*` links
- Verify: GET `http://localhost:3002/api/config` returns populated fields.

## Production notes
- CORS and proxies:
  - API sets `app.set('trust proxy', 1)` and registers CORS before the rate limiter.
  - Set `CORS_ORIGINS` to include all site origins, e.g.:
    - `https://foxshrinevtuber.com,https://www.foxshrinevtuber.com,https://mei-satsuki.net,https://www.mei-satsuki.net`
  - Optionally set `LOG_CORS=true` to print the computed list at startup.
- JWT secret:
  - In production, `JWT_SECRET` must be set or the API will exit.
- Node runtime:
  - API is pinned to Node 20.x in `api/package.json`.

## Testing
- Frontend: in `fox-shrine-vtuber/`
  - Run tests: `npm test`
  - Coverage: `npm run test:coverage`
- API: no unit tests currently; relies on schema/proc correctness. You can hit:
  - GET `/api/health`
  - GET `/api/config`

## Structure
- `api/`: Express API (helmet, cors, rate-limiter, Joi validation, JWT + refresh, Azure SQL via `mssql`)
  - `server.js`: CORS, CSP, config endpoints, auth, audit
  - `database-schema.sql`: Configuration + audit tables, procs
  - `seed-content-config.sql`: Seed data for homepage
  - `scripts/seed-content.js`: Helper to run the seed SQL
- `fox-shrine-vtuber/`: React app (React 19, Tailwind, Framer Motion)
  - `src/hooks/useConfigDatabase.js`: Loads and merges `/api/config` with defaults, caches to localStorage
  - `src/components/SEO.jsx`: Head tags via `react-helmet`
  - `src/components/PageTransition.jsx`: Unified page transitions

## Common tasks
- Update a config key (requires auth token with `config.write`):
  - PUT `/api/config/siteTitle` body: `{ "value": "My Site" }`
- Fetch just a category:
  - GET `/api/config/content`

## Troubleshooting
- CORS blocked in prod:
  - Ensure both apex and www origins are listed in `CORS_ORIGINS`
  - Redeploy the API after env changes
  - Optionally set `LOG_CORS=true` to print allowlist
- 429 rate limiting behind proxy:
  - Confirm `app.set('trust proxy', 1)` is active (already set in this API)
- React Helmet peer issues:
  - This project uses `react-helmet` for React 19 compatibility

Enjoy building! 🦊
