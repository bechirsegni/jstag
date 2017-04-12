/** @module jstag/io/collect */
import asap from '../timers/asap';
import extend from '../util/extend';
import isFunction from '../util/is-function';

/**
 * @exports ioCollect
 * @method
 * @param {Object} message
 * @param {string} url
 * @param {boolean} isMock
 * @todo add a description
 */
export default function ioCollect(message, url, isMock) {
  var that = this;
  var config = this.config;

  this.onSendStarted(message);

  message.dataMsg = config.serializer(extend({}, message.data));
  message.sendurl || (message.sendurl = []);
  message.sendurl.unshift(url);

  if (isMock) {
    asap(message.callback, message, this);
    return;
  }

  var transport = this.ioGetTransport(message, url);
// NOTE: this seems unnecessary, and exists only for backwards compatibility.
  message.channelName = transport.name;

  transport.send(url, extend({}, message, {
    callback: function collectCallback() {
      if (isFunction(message.callback)) {
        message.callback(message, that);
      }
      that.onSendFinished(message);
    }
  }));
}
