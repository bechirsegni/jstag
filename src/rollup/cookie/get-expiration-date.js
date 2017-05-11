/** @module jstag/cookie/get-cookie-expiration-date */
/**
 * @exports getCookieExpirationDate
 * @param {number} seconds
 * @returns {Date} - a date object relative to now
 */
export default function getCookieExpirationDate(seconds) {
  var date = new Date();
  date.setTime(date.getTime() + 1000 * seconds);
  return date;
}
