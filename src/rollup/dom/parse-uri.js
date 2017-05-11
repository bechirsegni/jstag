/** @module jstag/dom/parse-uri */
import hyper from './hyper';
import getUriOrigin from './get-uri-origin';
import filter from '../util/filter';
import attempt from '../util/attempt';
import object from '../util/object';
import map from '../util/map';
import isString from '../util/is-string';
import allKeys from '../util/all-keys';
/**
 * Parse a URI using the browser's native capabilities
 *
 * @private
 * @param {string} uri
 * @returns {Object} the parsed uri
 */
export default function parseUri(uri) {
  var parser = hyper('a', { href: uri });
  var stringValueKeys = filter(allKeys(parser), function(key) {
    var value = attempt(function() {
      // [compat 2] This lookup can throw in Internet Explorer :sadtaco:
      return parser[key];
    });
    if (value == null) {
      return false;
    }
    return isString(value);
  });
  var parsed = object(map(stringValueKeys, function(key) {
    return [ key, parser[key] ];
  }));

  // [compat 1] Note: older browsers that don't support CORS won't have `origin`:
  if (parsed.origin == null) {
    parsed.origin = getUriOrigin(parsed);
  }
  return parsed;
}
