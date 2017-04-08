import collectIdentity from './collect-identity';
import getEndpoint from './get-endpoint';
import appendQuery from '../util/append-query';
import extend from '../util/extend';
import forEach from '../util/for-each';
import now from '../util/now';
import { DEFAULT_COOKIE_NAME } from '../config';

/**
 * Send a message
 *
 * @private
 * @param {Object} the message to send
 * @param {boolean} isMock if passed, don't actually do any I/O
 * @throws {TypeError}
 */
export default function sendMessage(message, isMock) {
  isMock == null && (isMock = false);
  var that = this;
  var config = this.config;

  if (!config.url || !config.cid) {
    throw new TypeError('Must have collection url and ProjectIds (cid)');
  }
  if (this.blocked && !isMock) {
    config.payloadQueue.push(message);
    return;
  }
  if (isMock) {
    if (message.callback == null) {
      throw new TypeError('cannot call mock without a callback');
    }

    var memo = message.data;

    forEach(config.payloadQueue, function(item) {
      extend(memo, item.data);
    });
  }
  message.stream || (message.stream = config.stream);
  forEach(this.config.cid, function(cid) {
    var url = getEndpoint(config, cid) + (message.stream ? '/' + message.stream : '');

    // [compat 6] Internet Explorer has no `Array.prototype.indexOf`, so
    //     `contains` can't be generic. Just use `String.prototype.indexOf`
    if (url.indexOf('_uidn=') === -1 && config.cookie !== DEFAULT_COOKIE_NAME) {
      url = appendQuery(url, '_uidn=' + config.cookie);
    }

    message.data._ts = now();

    collectIdentity(message, config, that);

    that.getid(function(id) {
      if (id && !message.data._uid) {
        message.data._uid = id;
        message.data._getid = 't';
      }
      that.ioCollect(message, url, isMock);
    });
  });
}
