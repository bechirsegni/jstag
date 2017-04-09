/** @module jstag/util/strip-protocol */
/**
 * @exports stripProtocol
 * @param {string} url
 * @returns {string} a string containing the URL with the protocol removed
 */
export default function stripProtocol(url) {
  return url.replace(/^https?:\/\//, '');
}
