import normalizeEventArguments from './normalize-event-arguments';
import arraySlice from '../util/array-slice';
import extend from '../util/extend';

/**
 * @public
 * @method
 * @param {string} [stream] - the Lytics stream name
 * @param {Object} [data] - the payload to collect
 * @param {Function} [callback] - a callback to call once the message is
 * @todo add a description
 */
export default function mock() {
  var args = arraySlice(arguments);
  var message = normalizeEventArguments(args);

  message.data = extend({ _e: 'mk' }, this.pageData, message.data);

  this.sendMessage(message, true);
}
