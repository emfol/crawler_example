exports.deferred = function deferred() {
  let reject; let resolve; const promise = new Promise(((res, rej) => {
    resolve = res;
    reject = rej;
  }));
  return Object.freeze({promise, resolve, reject});
};
