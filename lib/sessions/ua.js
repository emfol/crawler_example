/**
 * Definitions
 */

const pool = Object.freeze([
  'Mozilla/5.0 (Windows NT 5.2; RW; rv:7.0a1) Gecko/20091211 Niadh/0.1.0a1pre',
  // eslint-disable-next-line max-len
  'Mozilla/5.0 (Macintosh; U; Intel Mac OS X; en) AppleWebKit/418.9 (KHTML, like Gecko) Niadh/0.1.0',
  // eslint-disable-next-line max-len
  'Mozilla/5.0 Niadh/0.1.0alpha1 (universal-apple-darwin11.0) libcurl/7.21.4 OpenSSL/0.9.8r zlib/1.2.5',
  'Mozilla/5.0 (X11) KHTML/4.9.1 (like Gecko) Niadh/0.1.0',
  // eslint-disable-next-line max-len
  'Mozilla/5.0 (Windows NT 10.0; WOW64; rv:38.0) Gecko/20100101 Niadh/0.1.0 Lightning/4.0.2',
  'Mozilla/5.0 (compatible; Niadh 10.0; Windows 3.1)',
  'Mozilla/5.0 (compatible; Niadh Web Downloader/0.1.0alpha1)',
  // eslint-disable-next-line max-len
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_6_8) AppleWebKit/537.13+ (KHTML, like Gecko) Version/0.1.0alpha Niadh/0.1.0alpha',
]);

const usage = new Map();

/**
 * Utils
 */

/**
 * Make sure an given number is a valid index
 * @param {number} number the number to be checked
 * @return {number} The valid index
 */
function getSafeIndex(number) {
  if (number === Math.floor(number) && number > 0) {
    return number % pool.length;
  }
  return 0;
}

/**
 * Exports
 */

exports.next = function next(origin) {
  const index = getSafeIndex(usage.get(origin));
  usage.set(origin, index + 1);
  return pool[index];
};
