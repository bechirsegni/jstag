import normalizeEventArguments from './normalize-event-arguments';
import arraySlice from '../util/array-slice';

/**
 * @public
 * @method
 * @param {string} [stream] - the Lytics stream name
 * @param {Object} [data] - the payload to collect
 * @param {Function} [callback] - a callback to call once the message is
 *     processed
 * @returns the normalized options hash
 * @todo add a description
 */
export default function parseEvent() {
  var args = arraySlice(arguments);

  return normalizeEventArguments(args);
}
