const session = require("./session.js");

/**
 * Exports
 */

exports.Session = session.Session;
exports.create = function create(url) {
  return new session.Session(url);
};
