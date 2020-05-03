const URL = require('url');
const axios = require("axios");
const ua = require("./ua.js");

class Session {
  constructor(url) {
    const parsedUrl = URL.parse(url);
    this.origin = parsedUrl.origin;
    this.baseURL = `${this.origin}/`;
    this.ua = ua.next(this.origin);
    // Build Axios instance
    if (parsedUrl.pathname) {
      baseUrl += parsedUrl.pathname;
    }
    this.axios = axios.create({
      baseURL: this.baseURL,
      headers: {
        "User-Agent": this.ua
      }
    });
    // @TODO: Add support for cookies
    this.cookie = null;
  }

  request(options) {
    return this.axios.request(options).then(function (response) {
      // @TODO: Properly handle cookies
      return response;
    });
  }
}

exports.Session = Session;
