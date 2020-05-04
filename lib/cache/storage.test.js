const md5 = require('md5');
const utils = require('../utils');
const storage = require('./storage.js');

const TTL = 250;
const opts = Object.freeze({
  ttl: TTL,
});

describe('Storage', () => {
  test('Writing', async () => {
    const key = getCacheKey('a', 'S');
    const result = await storage.write(key, 'Oops!', opts);
    expect(result).toBe(true);
  });
  test('Reading', async () => {
    const key = getCacheKey('a', 'S');
    const json = JSON.stringify({a: 'A', b: 'B'});
    let result = await storage.write(key, json, opts);
    expect(result).toBe(true);
    result = await storage.read(key, opts);
    expect(result).toBe(json);
  });
  test('TTL', async () => {
    const key = getCacheKey('a', 'S');
    const data = 'Oops! x2';
    let result = await storage.write(key, data, opts);
    expect(result).toBe(true);
    result = await storage.read(key, opts);
    expect(result).toBe(data);
    // sleep
    await utils.timeout(TTL);
    result = await storage.read(key, opts);
    expect(result).toBe(null);
  });
});

// eslint-disable-next-line require-jsdoc
function getCacheKey(query, service) {
  return `${md5(query)}:${service}`;
}
