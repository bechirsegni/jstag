/** @module jstag/core/page */
import normalizeEventArguments from './normalize-event-arguments';
import arraySlice from '../util/array-slice';
import extend from '../util/extend';

/**
 * @exports page
 * @method
 * @param {string} [stream] - the Lytics stream name
 * @param {Object} [data] - the payload to collect
 * @param {Function} [callback] - a callback to call once the message is
 *     processed
 * @todo add a description
 */
export default function page() {
  var args = arraySlice(arguments);
  var message = normalizeEventArguments(args);

  message.data = extend({ _e: 'pv' }, this.pageData, message.data);

  this.sendMessage(message);
}
