import deleteCookie from '../cookie/delete';

/**
 * Clears both cookies by name
 *
 * @public
 * @method
 */
export default function clearCookies() {
  deleteCookie(this.config.cookie);
  deleteCookie(this.config.sesname);
}
