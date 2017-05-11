/** @module jstag/cookie/delete */
import setCookie from './set';

/**
 * Delete a cookie
 *
 * @exports deleteCookie
 * @param {string} name
 */
export default function deleteCookie(name) {
  setCookie(name, '', -60);
}
