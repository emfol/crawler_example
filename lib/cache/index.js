const md5 = require('md5');
const {log4js} = require('../log4js');

/**
 * Definitions
 */

const logger = log4js.getLogger('Cache');
const services = Object.freeze({
  registered: new Map(),
  running: new Map(),
});

/**
 * Register a crawler
 * @param {string} name The name of the crawler
 * @param {function} service The service function to be executed
 */
function registerService(name, service) {
  if (typeof name === 'string' && typeof service === 'function') {
    services.registered.set(name, service);
    logger.info('Service successfully registered:', name);
  } else {
    logger.warn('Failed to register service:', name);
  }
}

/**
 * Get cache entry
 * @param {string} service The name of the service
 * @param {string} query The query string
 */
function get(service, query) {
  const normalizedQuery = normalize(query);
  const cacheKey = getCacheKey(normalizedQuery, service);
}

/**
 * Utils
 */

// eslint-disable-next-line require-jsdoc
function normalize(string) {
  return `${string}`.replace(/\s{2,}/g, ' ').trim().toLocaleLowerCase();
}

// eslint-disable-next-line require-jsdoc
function getCacheKey(query, service) {
  return `${md5(query)}:${service}`;
}

/**
 * Exports
 */

exports.registerService = registerService;
