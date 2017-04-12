/** @module jstag/core/clear-cookies */
import deleteCookie from '../cookie/delete';

/**
 * Clears both cookies by name
 *
 * @export clearCookies
 * @method
 */
export default function clearCookies() {
  deleteCookie(this.config.cookie);
  deleteCookie(this.config.sesname);
}
