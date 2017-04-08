import getCookie from '../cookie/get';
import setCookie from '../cookie/set';

/**
 * @public
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
