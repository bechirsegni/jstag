import jsonpGetId from './jsonp-get-id';
import getCookie from '../cookie/get';
import asap from '../timers/asap';
import makeId from '../util/make-id';
import once from '../util/once';

/**
 * @public
 * @method
 * @todo add a description
 */
export default function getid(callback) {
  var that = this;
  var wrappedCallback = once(function(id) {
    that.setid(id);
    callback(id);
  });
  var seerId = getCookie(this.config.cookie);

  if (seerId && seerId.length) {
    asap(wrappedCallback, seerId);
  } else if (this.config.loadid) {
    asap(jsonpGetId, this, wrappedCallback);
  } else {
    asap(makeId, wrappedCallback);
  }
}
