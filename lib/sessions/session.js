const {URL} = require('url');
const axios = require('axios');
const ua = require('./ua.js');
const {log4js} = require('../log4js');

/**
 * Definitions
 */

const logger = log4js.getLogger('Sessions');

/**
 * Session Object
 */
class Session {
  /**
   * Initialize a new session object with a base URL
   * @param {string} baseURL The base URL for the new session object
   */
  constructor(baseURL) {
    this.origin = new URL(baseURL).origin;
    this.ua = ua.next(this.origin);
    // Build Axios instance
    this.axios = axios.create({
      baseURL,
      timeout: 15000,
      headers: {
        'User-Agent': this.ua,
      },
    });
    // @TODO: Add support for cookies
    this.cookie = null;
  }

  /**
   * Perform request
   * @param {object} options options for the Axios request
   * @return {Promise} A promise that resolves to the Axios response object
   */
  request(options) {
    return this.axios.request(options).then((response) => {
      const cookie = response.headers['set-cookie'];
      if (cookie) {
        // @TODO: Properly handle cookies
        logger.info('set-cookie requested by', this.origin);
      }
      return response;
    });
  }
}

exports.Session = Session;
