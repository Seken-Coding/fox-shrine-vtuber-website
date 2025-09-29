const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {
  JWT_SECRET,
  JWT_EXPIRES_IN,
  REFRESH_TOKEN_EXPIRES_IN,
} = require('../config');

const generateTokens = (userId) => {
  const accessToken = jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  const refreshToken = jwt.sign({ userId, type: 'refresh' }, JWT_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRES_IN,
  });

  return { accessToken, refreshToken };
};

const hashPassword = async (password) => {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
};

const verifyPassword = async (password, hash) => bcrypt.compare(password, hash);

module.exports = {
  generateTokens,
  hashPassword,
  verifyPassword,
};
