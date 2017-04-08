/**
 * @private
 * @returns {Function} - The number of milliseconds since the UNIX epoch
 */
export default function now() {
  return new Date().getTime();
}
