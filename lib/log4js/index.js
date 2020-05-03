const log4js = require('log4js');
const config = require('../../config.json');

log4js.configure(config.log4js);

exports.log4js = log4js;
