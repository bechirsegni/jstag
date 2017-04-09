/** @module jstag/cookie/set */
import parseUri from '../dom/parse-uri';
import location from '../dom/location';
import document from '../dom/document';
import encodeURIComponent from '../dom/encode-uri-component.js';
import getExpirationDate from './get-expiration-date';

/**
 * Set a cookie with a value of any serializable type
 *
 * @exports setCookie
 * @param {string} name - the cookie name
 * @param {any} value - the cookie value
 * @param {number} seconds - the seconds until expiration relative from now
 */
export default function setCookie(name, value, seconds) {
  seconds || (seconds = 90 * 24 * 60 * 60); // 90 days
  var expires = getExpirationDate(seconds);
  var domain = parseUri(location).hostname;
  var cookieValue = (
    name + '=' + encodeURIComponent(value) +

    // Note: valid cookies must have at least 2 dots in the domain! [compat]
    (domain && domain.split('.').length > 1 ? '; domain=' + domain : '') +
    ('; expires=' + expires.toUTCString())
  );

  document.cookie = cookieValue;
}
