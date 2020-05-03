const {log4js} = require('../log4js');
const ml = require('../crawlers/ml.js');

/**
 * Definitions
 */

const logger = log4js.getLogger('Endpoint-Search');

/**
 * Search API
 */

exports.search = async function search(req, res) {
  let data;
  try {
    const result = await ml.run({
      query: 'cadeado',
      handlers: {
        partialResult(data) {
          logger.info('Partial result:', data.length);
        },
      },
    });
    data = {result};
  } catch (e) {
    data = {
      error: {
        type: 'request_failed',
        message: e.message,
      },
    };
  }
  return res.json(data);
};
