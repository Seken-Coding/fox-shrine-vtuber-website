/**
 * Jest configuration for the Express API package.
 * Uses the Node test environment and clears mocks between tests.
 */
module.exports = {
  testEnvironment: 'node',
  clearMocks: true,
  collectCoverageFrom: ['routes/**/*.js', 'middleware/**/*.js', 'utils/**/*.js'],
  coverageDirectory: 'coverage',
  setupFilesAfterEnv: ['<rootDir>/tests/setupTests.js'],
  testMatch: ['**/tests/**/*.test.js'],
  watchPathIgnorePatterns: ['<rootDir>/coverage/', '<rootDir>/dist/'],
};
