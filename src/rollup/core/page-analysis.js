import getCookie from '../cookie/get';
import setCookie from '../cookie/set';
import location from '../dom/location';
import navigator from '../dom/navigator';
import parseUri from '../dom/parse-uri';
import screen from '../dom/screen';
import contains from '../util/contains';
import extend from '../util/extend';
import filterObject from '../util/filter-object';
import parseQueryString from '../util/parse-query-string';
import startsWith from '../util/starts-with';
import stripProtocol from '../util/strip-protocol';

/**
 * @public
 * @method
 * @todo add a description
 */
export default function pageAnaylsis() {
  var config = this.config;
  var sessionCookie = getCookie(config.sesname);
  var pageData = this.pageData;
  var uri = parseUri(config.location);

  if (uri.search.length > 0) {
    var queryParams = parseQueryString(uri.search);

  // `utm_` prefixes are generic tracking-related parameters
    extend(pageData, filterObject(queryParams, function(tuple) {
      return startsWith(tuple[0], 'utm_');
    }));

    if (config.qsargs && config.qsargs.length > 0) {
      extend(pageData, filterObject(queryParams, function(tuple) {
        return contains(config.qsargs, tuple[0]);
      }));
    }
  }

  if (!sessionCookie) {
    pageData._sesstart = '1';
  }

  var referrer = this.referrer;

  if (referrer && referrer.length > 0) {
    var referrerHost = /\/\/(.*)\//.exec(referrer);

    if (referrerHost && !contains(referrerHost[1], location.host)) {
      var strippedReferrer = stripProtocol(referrer);

      pageData._ref = strippedReferrer;

      if (!sessionCookie) {
        pageData._sesref = strippedReferrer;
      }
    }
  }

  setCookie(config.sesname, 'e', config.sessecs);

  pageData._tz = parseInt(-new Date().getTimezoneOffset() / 60, 10);
  pageData._ul = navigator.language || navigator.userLanguage;

  if (screen) {
    pageData._sz = screen.width + 'x' + screen.height;
  }
  this.pageData = pageData;
}
