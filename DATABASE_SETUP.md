## Fox Shrine Database Setup

The entire SQL schema and seed data for the Fox Shrine VTuber backend is now consolidated into a single script: `api/setup-database.sql`. This replaces the previous individual files (`database-schema.sql`, `user-roles-schema.sql`, `grant-permissions.sql`, `seed-content-config.sql`, and `fix-admin-user.sql`).

### Prerequisites

- SQL Server 2016+ (on-premises or Managed Instance) with an existing `Vtuber_Website` database
- SQL Server Management Studio (SSMS) or Azure Data Studio running in T-SQL mode
- A login with `db_owner` on `Vtuber_Website` and (optionally) server-level rights to create logins

### Script configuration

At the top of the script a temporary table named `#SetupOptions` is created to hold the configurable flags. Update the single `INSERT` statement before running:

- `CreateAppLogin`: set to `1` to create a server-level login in `master` before provisioning the database objects.
- `AppLogin` / `AppPassword`: credentials for the optional application login. Change the placeholder password immediately for production use.
- `GrantExecuteToApp`: set to `1` to grant `EXECUTE` on the `dbo` schema to the database user mapped to `AppLogin`.
- `DefaultAdminPasswordHash`: BCrypt hash applied to the default `foxadmin` account. Generate a new hash for production deployments.

> ℹ️ The script now issues `USE [master];` followed by `USE [Vtuber_Website];`. Make sure the `Vtuber_Website` database already exists (or update the `USE` statements to match your database name).

### Running from SSMS / Azure Data Studio

1. Open `api/setup-database.sql` in SSMS.
2. Update the values in the `INSERT INTO #SetupOptions` statement as needed (login toggle, password, default hash).
3. Execute the entire script. It will create the login in `master` (when `CreateAppLogin = 1`) and then automatically switch to `Vtuber_Website` to provision the schema and seed data.

### What the script does

1. Optionally creates a SQL login (when `CreateAppLogin = 1`).
2. Creates or updates tables, indexes, triggers, and stored procedures for configuration, auditing, roles, users, sessions, and activity logging. Existing `Configuration` rows are back-filled with required metadata columns (`Category`, `IsActive`, timestamps, `CreatedBy`/`UpdatedBy`), and `Users` columns are automatically widened to match production column lengths.
3. Seeds configuration data (without overwriting existing values), default roles, permissions, and the `foxadmin` Super Admin account.
4. Optionally grants `db_datareader`, `db_datawriter`, and `EXECUTE` permissions to the application login.

### Re-running the script

- Tables and indexes are created only when missing, and missing columns (such as `UserAgent`, `LoginAttempts`, `LockedUntil`) are added automatically.
- Existing `Configuration` tables gain the standardized metadata columns if they were absent, with sensible defaults applied to legacy rows.
- Existing `Users` tables are expanded to `NVARCHAR(100)` usernames, `NVARCHAR(510)` email/password hashes, and `NVARCHAR(1000)` avatars when narrower columns are detected.
- Configuration seed values are inserted when keys are absent; existing values are preserved, while categories/descriptions are refreshed.
- Role and permission seeds are idempotent.
- The `foxadmin` account is updated with the supplied hash every run—rotate the hash after initial provisioning.

### Verification steps

After the script completes:

1. Confirm the database objects exist with SSMS or `sqlcmd` queries (see `infra/verification-checklist.md`).
2. Sign in with the `foxadmin` account (after setting a new password) to verify authentication works.
3. Run the API locally against the new database to ensure configuration endpoints return seeded content.

### Updating live content safely

- Use `api/update-content-config.sql` whenever you need to refresh homepage prose, social links, or JSON payloads in `dbo.Configuration`. Adjust the `VALUES` block, run the script, and the `MERGE` will upsert every configured key in one go.
- The script calls `dbo.UpsertConfiguration` indirectly through the `MERGE`, keeping audit triggers intact while forcing `IsActive = 1` and stamping `UpdatedBy = 'content-update-script'`.
- Validate the preview result set at the end of the script before refreshing the frontend to confirm the new JSON/text values look correct.

Record any overrides (e.g., production URLs) so they can be re-applied if the script is executed again in another environment.
