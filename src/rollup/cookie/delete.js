import setCookie from './set';

/**
 * Delete a cookie
 *
 * @private
 * @param {string} name
 */
export default function deleteCookie(name) {
  setCookie(name, '', -60);
}
