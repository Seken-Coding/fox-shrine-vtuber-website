const DEFAULT_JWT_SECRET = 'fox-shrine-vtuber-secret-key-change-in-production';

const JWT_SECRET = process.env.JWT_SECRET || DEFAULT_JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d';

if (
  process.env.NODE_ENV === 'production' &&
  (!process.env.JWT_SECRET || JWT_SECRET === DEFAULT_JWT_SECRET)
) {
  // Fail fast in production if the JWT secret is missing or the default placeholder
  console.error(
    'FATAL: JWT_SECRET is missing or using default in production. Set a strong JWT_SECRET.'
  );
  process.exit(1);
}

module.exports = {
  JWT_SECRET,
  JWT_EXPIRES_IN,
  REFRESH_TOKEN_EXPIRES_IN,
};
