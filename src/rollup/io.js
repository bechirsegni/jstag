/** @module jstag */
import canonicalName from './name/canonical';
import succinctName from './name/succinct';
import JSTag from './core/jstag';
import getCookie from './cookie/get';
import setCookie from './cookie/set';
import deleteCookie from './cookie/delete';
import parseUri from './dom/parse-uri';
import window from './dom/window';
import clearTimers from './timers/clear-timers';
import contains from './util/contains';
import extend from './util/extend';
import forEach from './util/for-each';
import filter from './util/filter';
import filterObject from './util/filter-object';
import map from './util/map';
import object from './util/object';
import once from './util/once';
import pairs from './util/pairs';
import reduce from './util/reduce';
import trim from './util/trim';
import parseQueryString from './util/parse-query-string';

window[canonicalName] || (window[canonicalName] = window[succinctName] || {});
window[canonicalName].JSTag = JSTag;
window[canonicalName].init = (function facade() {
  // Cache for the backing singleton instance
  var instance;

  function expose(methodNames) {
    forEach(methodNames, function(methodName) {
      window[canonicalName][methodName] = function() {
        return instance[methodName].apply(instance, arguments);
      };
    });
  }

  // Expose the singleton facade interface
  expose([
    'send',
    'mock',
    'identify',
    'page',
    'pageView',
    'block',
    'unblock',
    'parseEvent',
    'clearCookies'
  ]);

  // these properties are exposed for backwards compatibility:
  window[canonicalName].extend = extend;
  window[canonicalName].ckieGet = getCookie;
  window[canonicalName].ckieSet = setCookie;
  window[canonicalName].ckieDel = deleteCookie;
  window[canonicalName].isLoaded = false;

  window[canonicalName].util = {
    forEach: forEach,
    reduce: reduce,
    map: map,
    filter: filter,
    contains: contains,
    pairs: pairs,
    object: object,
    filterObject: filterObject,
    trim: trim,
    extend: extend,
    expose: expose,
    once: once,
    parseUri: parseUri,
    parseQueryString: parseQueryString
  };

  function reset() {
    if (instance) {
      instance.clearCookies();
    }
  // Do not fire any timers from a previously initialized instance.
    clearTimers();
  }

  return function init(config) {
    reset();
    instance = new JSTag(config);
    instance.pageAnalysis();

  // these properties are exposed for backwards compatibility:
    window[canonicalName].isLoaded = true;
    window[canonicalName].config = instance.config;

    return reset;
  };
}());

// Also export with a short-but-sweet name (usually "jstag")
window[succinctName] = window[canonicalName];
