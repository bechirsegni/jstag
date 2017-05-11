/** @module jstag/util/pairs */
import reduce from './reduce';
import keys from './keys';
/**
 * Return an array of all the key-value pairs of a given object
 *
 * @exports pairs
 * @param {Object}
 * @returns {Array.Array.<string>} an array of arrays of key-value pairs
 */
export default function pairs(source) {
  return reduce(keys(source), function(memo, key) {
    memo.push([ key, source[key] ]);
    return memo;
  }, []);
}
