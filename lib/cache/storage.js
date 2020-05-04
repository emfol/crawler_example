const fs = require('fs');
const path = require('path');
const utils = require('../utils');
const {log4js} = require('../log4js');
const config = require('../../config.json');

/**
 * Constants
 */

const DATA_DIR = config.cache.dir.split('/').join(path.sep);
const DEFAULT_TTL = config.cache.ttl || 300 * 1000; // 5min
const ENCODING = 'utf8';

/**
 * Definitions
 */

const logger = log4js.getLogger('Storage');

/**
 * Read data from storage if available
 * @param {string} key The key to retrieve stored data
 * @param {Object} options Options object
 * @return {Promise} A promise that resolves to the data stored data
 */
async function read(key, options) {
  const {path} = getKeyInfo(key);
  const ttl = utils.numberOrZeroInObject(options, 'ttl') || DEFAULT_TTL;
  let data = null;
  try {
    const stats = await stat(path);
    if (Date.now() - stats.mtimeMs > ttl) {
      await unlink(path);
    } else {
      data = await readFile(path);
    }
  } catch (e) {
    if (e.code !== 'ENOENT') {
      logger.error('Read error:', e.message);
    }
  }
  return data;
}

/**
 * Write data to storage
 * @param {string} key The key to store the data
 * @param {string} data The data to be stored
 * @param {Object} options Options object
 */
async function write(key, data, options) {
  const {dir, path} = getKeyInfo(key);
  let result = false;
  try {
    await mkdir(dir);
    result = await writeFile(path, data);
  } catch (e) {
    logger.error('Write error:', e.message);
  }
  return result;
}

/**
 * Utils
 */

// eslint-disable-next-line require-jsdoc
function getKeyInfo(key) {
  const dir = [DATA_DIR, key.slice(33), key.slice(0, 2)].join(path.sep);
  return Object.freeze({
    dir,
    path: `${dir}${path.sep}${key.slice(2, 32)}`,
  });
}

// eslint-disable-next-line require-jsdoc
function stat(path) {
  const deferred = utils.deferred();
  fs.stat(path, function(error, stat) {
    if (error) {
      deferred.reject(error);
      return;
    }
    deferred.resolve(stat);
  });
  return deferred.promise;
}

// eslint-disable-next-line require-jsdoc
function readFile(path) {
  const deferred = utils.deferred();
  fs.readFile(path, ENCODING, function(error, data) {
    if (error) {
      deferred.reject(error);
      return;
    }
    deferred.resolve(data);
  });
  return deferred.promise;
}

// eslint-disable-next-line require-jsdoc
function mkdir(path) {
  const deferred = utils.deferred();
  const options = {recursive: true};
  fs.mkdir(path, options, function(error) {
    if (error) {
      deferred.reject(error);
      return;
    }
    deferred.resolve(true);
  });
  return deferred.promise;
}

// eslint-disable-next-line require-jsdoc
function writeFile(path, data) {
  const deferred = utils.deferred();
  fs.writeFile(path, data, ENCODING, function(error) {
    if (error) {
      deferred.reject(error);
      return;
    }
    deferred.resolve(true);
  });
  return deferred.promise;
}

// eslint-disable-next-line require-jsdoc
function unlink(path) {
  const deferred = utils.deferred();
  fs.unlink(path, function(error) {
    if (error) {
      deferred.reject(error);
      return;
    }
    deferred.resolve(true);
  });
  return deferred.promise;
}

/**
 * Exports
 */

exports.read = read;
exports.write = write;
