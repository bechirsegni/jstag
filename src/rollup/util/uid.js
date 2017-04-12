/** @module jstag/util/uid */
/**
 * @exports uid
 * @returns {string} a fairly unique identifier
 */
export default function uid() {
  return 'u_' + Math.floor(Math.random() * 1e18);
}
