/** @module jstag/util/now */
/**
 * The number of milliseconds since the UNIX epoch
 * @exports now
 * @returns {Function}
 */
export default function now() {
  return new Date().getTime();
}
