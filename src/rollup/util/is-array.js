/**
 * @private
 * @param {any} it
 * @returns {boolean}
 */
export default function isArray(it) {
  return '[object Array]' === {}.toString.call(it);
}
