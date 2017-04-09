/** @module jstag/util/append-query */
import contains from './contains';

/**
 * @exports appendQuery
 * @param {string} url - the base URL to append to
 * @param {string} query - the query string to append
 * @returns {string} the url with the specified query param appended
 */
export default function appendQuery(url, query) {
  return url + (contains(url, '?') ? '&' : '?') + query;
}
