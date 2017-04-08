import location from '../dom/location';
import isMobile from '../dom/is-mobile';
import isIFrame from '../dom/is-iframe';
import userAgent from '../dom/user-agent';
import getCookie from '../cookie/get';
import stripProtocol from '../util/strip-protocol';
import { IO_VERSION } from '../config';

/**
 * @todo add a description
 */
export default function collectIdentity(message, config, instance) {
  var data = message.data;

  if (isMobile()) {
    data._mob = 't';
    var mobType = 'unknown';
    if (/Android/i.test(userAgent)) {
      mobType = 'Android';
    } else if (/BlackBerry/i.test(userAgent)) {
      mobType = 'Blackberry';
    } else if (/iPhone|iPad|iPod/i.test(userAgent)) {
      mobType = 'IOS';
    } else if (/IEMobile/i.test(userAgent)) {
      mobType = 'WinMobile';
    }
    data._device = mobType;
  } else {
    data._nmob = 't';
    data._device = 'desktop';
  }

// get location
  data.url = stripProtocol(location.href);

  if (isIFrame()) {
    data._if = 't';
  }

// clean up uid
  if ('_uid' in data && !data._uid) {
    delete data._uid;
  }

// collect google analytics entropy:
  var googleAnalyticsCookie = getCookie('__utma');

// this is here to support an experiment with collecting potentially
//     user-identifying entropy
  if (googleAnalyticsCookie && googleAnalyticsCookie.length > 10) {
    data._ga = googleAnalyticsCookie.substring(0, googleAnalyticsCookie.indexOf('.', 10));
  }

  if (!('_uid' in data)) {
    var seerId = getCookie(config.cookie);
    if (seerId && seerId.length) {
      data._uid = seerId;
    }
  }

  var optimizelyCookie = getCookie('optimizelyEndUserId');

  if (optimizelyCookie) {
    data.optimizelyid = optimizelyCookie;
  }

  if (!('_v' in data)) {
    data._v = IO_VERSION;
  }

  if (instance && instance.changeId) {
    data._uido = instance.changeId;
  }
}
