/** @module jstag/util/all-keys */
/**
 * Return all the keys of an object, including inherited properties. Chances are,
 * this thing'll get deoptimized.
 *
 * @exports allKeys
 * @param {object} source - the object to extract keys from
 * @returns {string[]} the enumerable keys of the source, or any object on its
 *     prototype chain
 */
export default function allKeys(obj) {
  var result = [];
  /* eslint-disable guard-for-in */
  for (var key in obj) {
    result.push(key);
  }
  /* eslint-enable guard-for-in */
  return result;
}
