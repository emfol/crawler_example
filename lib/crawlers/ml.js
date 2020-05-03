const utils = require('../utils');
const {Session} = require('../sessions');
const {log4js} = require('../log4js');

/**
 * Constants
 */

const BASE_URL = 'https://api.mercadolibre.com/sites/MLB/';
const MAX_REQUESTS = 10;
const MAX_PAGE_SIZE = 50;

/**
 * Definitions
 */

const logger = log4js.getLogger('Crawler-ML');

/**
 * Exports
 */

exports.run = async function run(options) {
  const query = utils.stringOrNullInObject(options, 'query');
  const partialResultHandler = utils.functionOrNoOpInObject(
      options,
      'handlers.partialResult',
  );
  logger.info('Running search job for:', query);
  const session = new Session(BASE_URL);
  const ids = new Set();
  let result = [];
  for (let offset = 0, request = 0; request < MAX_REQUESTS; ++request) {
    logger.info('Initiating search at offset:', offset);
    const partialResult = await search(session, ids, query, offset);
    if (partialResult.data !== null) {
      const {data, next} = partialResult;
      logger.info('Search returned item count:', data.length);
      result = result.concat(data);
      partialResultHandler(result);
      if (next > 0) {
        offset = next;
        continue;
      }
    }
    break;
  }
  logger.info('Search job finished with result count:', result.length);
  return result;
};

/**
 * Utils
 */

/**
 * Perform search using specified endpoint
 * @param {Session} session The Session instance to perform search
 * @param {Set} ids A Set instance contaning all the loaded IDs
 * @param {string} q The query string
 * @param {number} offset The offset to start loading from
 */
async function search(session, ids, q, offset) {
  const result = {
    data: null,
    next: -1,
  };
  const {data} = await session.request({
    method: 'GET',
    url: '/search',
    params: {
      q,
      offset,
      limit: MAX_PAGE_SIZE,
    },
  });
  const pagingTotal = utils.numberOrZeroInObject(data, 'paging.total');
  const pagingResults = utils.arrayInObject(data, 'results');
  const pagingResultsLength = pagingResults.length;
  if (pagingTotal > 0 && pagingResultsLength > 0) {
    const data = [];
    pagingResults.forEach(function(entry) {
      const item = format(entry);
      if (item.id !== null) {
        if (ids.has(item.id)) {
          logger.warn('Repated product ID on result set:', item.id);
        } else {
          ids.add(item.id);
          data.push(item);
        }
      }
    });
    result.data = data;
    if (pagingTotal > offset + pagingResultsLength) {
      result.next = offset + pagingResultsLength;
    }
  }
  return result;
}

/**
 * Format a result entry
 * @param {Object} entry The original object returned from the endpoint
 * @return {Object} The formatted object
 */
function format(entry) {
  return Object.freeze({
    id: utils.stringOrNullInObject(entry, 'id'),
    name: utils.stringOrNullInObject(entry, 'title'),
    link: utils.stringOrNullInObject(entry, 'permalink'),
    price: utils.numberOrZeroInObject(entry, 'price'),
    currency: utils.stringOrNullInObject(entry, 'currency_id'),
    store: utils.stringOrNullInObject(entry, 'seller.eshop.nick_name'),
    state: utils.stringOrNullInObject(entry, 'address.state_name'),
  });
}
