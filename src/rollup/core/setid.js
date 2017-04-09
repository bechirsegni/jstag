/** @module jstag/core/setid */
import getCookie from '../cookie/get';
import setCookie from '../cookie/set';

/**
 * @exports setid
 * @method
 * @todo add a description
 */
export default function setid(id) {
  var cookieName = this.config.cookie;
  var oldId = getCookie(cookieName);
  if (oldId && oldId.length) {
    this.changeId = oldId;
  }
  setCookie(cookieName, id);
}
