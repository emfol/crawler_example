const {deferred} = require('./deferred.js');
const {resolveObjectPath} = require('./resolveObjectPath.js');

/**
 * Utils
 */

// eslint-disable-next-line require-jsdoc
function noOp() {}

// eslint-disable-next-line require-jsdoc
function functionOrNoOp(subject) {
  return typeof subject === 'function' ? subject : noOp;
}

// eslint-disable-next-line require-jsdoc
function stringOrNull(subject) {
  return typeof subject === 'string' ? subject : null;
}

// eslint-disable-next-line require-jsdoc
function numberOrZero(subject) {
  return typeof subject === 'number' && !isNaN(subject) ?
    subject :
    0;
}

// eslint-disable-next-line require-jsdoc
function array(subject) {
  return Array.isArray(subject) ? subject : [];
}

// eslint-disable-next-line require-jsdoc
function functionOrNoOpInObject(object, path) {
  return functionOrNoOp(resolveObjectPath(object, path));
}

// eslint-disable-next-line require-jsdoc
function stringOrNullInObject(object, path) {
  return stringOrNull(resolveObjectPath(object, path));
}

// eslint-disable-next-line require-jsdoc
function numberOrZeroInObject(object, path) {
  return numberOrZero(resolveObjectPath(object, path));
}

// eslint-disable-next-line require-jsdoc
function arrayInObject(object, path) {
  return array(resolveObjectPath(object, path));
}

/**
 * Exports
 */

exports.deferred = deferred;
exports.resolveObjectPath = resolveObjectPath;

exports.noOp = noOp;
exports.functionOrNoOp = functionOrNoOp;
exports.numberOrZero = numberOrZero;
exports.array = array;
exports.functionOrNoOpInObject = functionOrNoOpInObject;
exports.stringOrNull = stringOrNull;
exports.stringOrNullInObject = stringOrNullInObject;
exports.numberOrZeroInObject = numberOrZeroInObject;
exports.arrayInObject = arrayInObject;
