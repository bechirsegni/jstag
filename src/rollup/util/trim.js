/**
 * Trim leading and trailing whitespace from a string
 *
 * @public
 * @param {string} str - a string that may have leading or trailing whitespace
 * @returns {string} the string without leading or trailing whitespace
 */
export default function trim(str) {
  return str.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
}
