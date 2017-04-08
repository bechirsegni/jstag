import window from './window';
import document from './document';
import hyper from './hyper';
import appendQuery from '../util/append-query';
import attempt from '../util/attempt';
import once from '../util/once';
import uid from '../util/uid';

/**
 * Make a JSONP request
 *
 * @param {string} url
 * @param {Function} callback
 */
export default function jsonp(url, callback) {
  var callbackId = uid();
  var script = hyper('script', { src: appendQuery(url, 'callback=' + callbackId) });

  window[callbackId] = once(function() {
    window[callbackId] = undefined;
    attempt(function() { document.body.removeChild(script); });
    script = undefined;
    callback.apply(null, arguments);
  });

  document.body.appendChild(script);
}
