const cache = require('../cache');
const {log4js} = require('../log4js');

/**
 * Constants
 */

const DEFAULT_SERVICE = 'ML';

/**
 * Definitions
 */

const logger = log4js.getLogger('Endpoint-Search');

/**
 * Search API
 */

exports.search = async function search(req, res) {
  let status = 200;
  let data;
  try {
    const {search, limit} = Object(req.body);
    data = await cache.get(DEFAULT_SERVICE, search, limit);
  } catch (e) {
    if (e.message === 'bad_input') {
      status = 400;
      data = {
        error: {
          type: 'bad_input',
          message: 'Bad input data',
        },
      };
    } else {
      status = 500;
      data = {
        error: {
          type: 'request_failed',
          message: e.message,
        },
      };
      logger.error('Search error:', e.message);
    }
  }
  return res.status(status).json(data);
};
