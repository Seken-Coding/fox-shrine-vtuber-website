const express = require('express');

/**
 * Builds an isolated Express instance for exercising a router under test.
 * Allows optional injection of additional middleware (e.g., auth stubs).
 *
 * @param {import('express').Router} router Express router to mount.
 * @param {Object} [options]
 * @param {string} [options.basePath='/'] Base path to mount the router on.
 * @param {Array<import('express').RequestHandler>} [options.before=[]] Middlewares to register before router.
 * @returns {import('express').Application}
 */
const createTestApp = (router, options = {}) => {
  const { basePath = '/', before = [] } = options;

  const app = express();
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  before.forEach((middleware) => app.use(basePath, middleware));
  app.use(basePath, router);

  return app;
};

module.exports = createTestApp;
