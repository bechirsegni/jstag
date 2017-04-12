/** @module jstag/util/is-object */
/**
 * @exports isObject
 * @param {any} it
 * @returns {boolean}
 */
export default function isObject(it) {
  return it && 'object' === typeof it;
}
