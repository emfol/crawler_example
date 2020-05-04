/* eslint-disable require-jsdoc */
const md5 = require('md5');
const utils = require('../utils');
const {log4js} = require('../log4js');
const storage = require('./storage.js');
const config = require('../../config.json');

/**
 * Definitions
 */

const TTL = config.cache.ttl || 300 * 1000; // 5 min
const logger = log4js.getLogger('Cache');
const getNextId = (function() {
  let id = 0;
  return function getNextId() {
    id = (id < Number.MAX_SAFE_INTEGER ? id : 0) + 1;
    return id;
  };
}());
const sharedOptions = Object.freeze({
  ttl: TTL,
});
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
 * @param {number} limit The expected amount of records
 * @return {Promise} A promise that resolved to the expected records
 */
async function get(service, query, limit) {
  if (badParams(service, query, limit)) {
    throw new Error('bad_input');
  }
  const entry = makeRequestEntry(service, query, limit);
  const data = await getFromCache(entry);
  if (data !== null) {
    return data;
  }
  return await getFromService(entry);
}

/**
 * Utils
 */

function badParams(service, query, limit) {
  const emptyRegex = /\S/;
  return (
    typeof services.registered.get(service) !== 'function' ||
    typeof query !== 'string' ||
    !emptyRegex.test(query) ||
    Math.floor(limit) !== limit ||
    limit < 10 ||
    limit > 500
  );
}

function makeRequestEntry(service, query, limit) {
  const normalizedQuery = normalize(query);
  return Object.freeze({
    service,
    limit,
    query: normalizedQuery,
    key: getCacheKey(normalizedQuery, service),
    id: getNextId(),
  });
}

function makeAwaitingRequestEntry(requestEntry) {
  const deferred = utils.deferred();
  return Object.freeze({
    requestEntry,
    deferred,
  });
}

function makeRunningServiceEntry(key) {
  return Object.seal({
    key,
    awaiting: [],
    partialResult: null,
  });
}

function normalize(string) {
  return `${string}`.replace(/\s{2,}/g, ' ').trim().toLocaleLowerCase();
}

function getCacheKey(query, service) {
  return `${md5(query)}:${service}`;
}

function getResult(data, limit) {
  if (Array.isArray(data) && data.length > 0) {
    return data.length > limit ? data.slice(0, limit) : data;
  }
  return null;
}

function hasEnough(data, expected) {
  return Array.isArray(data) && data.length > expected;
}

async function getFromCache(requestEntry) {
  let result = null;
  try {
    let data = await storage.read(requestEntry.key, sharedOptions);
    if (data !== null) {
      data = getResult(JSON.parse(data), requestEntry.limit);
      if (data !== null) {
        result = data;
      }
    }
  } catch (e) {
    logger.error('Failed to restore data from cache:', e.message);
  }
  return result;
}

async function saveToCache(key, data) {
  try {
    if (Array.isArray(data) && data.length > 0) {
      const json = JSON.stringify(data);
      if (await storage.write(key, json, sharedOptions)) {
        logger.info('Data saved to cache:', key);
        return true;
      }
    }
  } catch (e) {
    logger.error('Error saving data to cache:', e.message);
  }
  return false;
}

async function getFromService(requestEntry) {
  const running = services.running.get(requestEntry.key) ||
    runService(requestEntry);
  if (!hasEnough(running.partialResult, requestEntry.limit)) {
    const awaitingRequest = makeAwaitingRequestEntry(requestEntry);
    running.awaiting.push(awaitingRequest);
    logger.info(
        'Request waiting for service result:',
        requestEntry.key,
        requestEntry.id,
        requestEntry.limit,
    );
    return getResult(
        await awaitingRequest.deferred.promise,
        requestEntry.limit,
    );
  }
  logger.info(
      'Request serviced by partial result:',
      requestEntry.key,
      requestEntry.id,
  );
  return getResult(running.partialResult, requestEntry.limit);
}

function runService(requestEntry) {
  const fn = services.registered.get(requestEntry.service);
  const running = makeRunningServiceEntry(requestEntry.key);
  Promise.resolve(fn({
    query: requestEntry.query,
    handlers: {
      partialResult: partialResultHandler.bind(null, running),
    },
  })).then(
      serviceCompletionHandler.bind(null, running),
      serviceFailedHandler.bind(null, running),
  );
  services.running.set(running.key, running);
  return running;
}

function partialResultHandler(running, data) {
  running.partialResult = data;
  running.awaiting = running.awaiting.filter(function(entry) {
    const {limit} = entry.requestEntry;
    if (hasEnough(data, limit)) {
      const {key, id} = entry.requestEntry;
      logger.info(
          'Removing request from waiting list:',
          key,
          id,
      );
      entry.deferred.resolve(getResult(data, limit));
      return false;
    }
    return true;
  });
}

function serviceFailedHandler(running, error) {
  services.running.delete(running.key);
  while (running.awaiting.length > 0) {
    const {deferred, requestEntry} = running.awaiting.pop();
    logger.info(
        'Rejecting request from waiting list:',
        requestEntry.key,
        requestEntry.id,
    );
    deferred.reject(error);
  }
  logger.error('Service failed', error);
}

function serviceCompletionHandler(running, data) {
  saveToCache(running.key, data);
  services.running.delete(running.key);
  while (running.awaiting.length > 0) {
    const {deferred, requestEntry} = running.awaiting.pop();
    logger.info(
        'Finalizing request from waiting list:',
        requestEntry.key,
        requestEntry.id,
    );
    deferred.resolve(getResult(data, requestEntry.limit));
  }
  logger.info('Service completed!', running.key);
}

/**
 * Exports
 */

exports.registerService = registerService;
exports.get = get;
