/**
 * Return true if the haystack string starts with the needle string
 *
 * @private
 * @param {string} haystack - a string to search in
 * @param {string} needle - a string to search for
 * @returns {string} the
 */
export default function startsWith(haystack, needle) {
  return haystack.indexOf(needle) === 0;
}
