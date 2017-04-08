import indexOf from './index-of';
/**
 * Does this array-like `haystack` contain the given element `needle`. This
 *     is primarily designed to work with arrays and strings
 *
 * @public
 * @param {(string|Array.<*>)} haystack - the array-like to search in
 * @param {any} needle - the object to search for
 * @todo as written this is not generic in old browsers like IE
 */
export default function contains(haystack, needle) {
  return indexOf(haystack, needle) !== -1;
}
