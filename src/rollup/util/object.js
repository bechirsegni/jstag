/** @module jstag/util/object */
import reduce from './reduce';

/**
 * Return an object from an array of arrays of key-value pairs
 *
 * @exports object
 * @param {Array.Array.<string>} an array of arrays of key-value pairs
 * @returns {Object} an object containing the specified keys and values
 */
export default function object(source) {
  return reduce(source, function(memo, pair) {
    memo[pair[0]] = pair[1];
    return memo;
  }, {});
}
