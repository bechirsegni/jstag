/** @module jstag/core/normalize-event-arguments */
import forEach from '../util/for-each';
import deprecation from '../util/deprecation';

/**
 * This method takes parameters in any order, and categorizes them based on
 *     their data type. It exists for backwards compatibility, because the
 *     parameters were added over time, and so this signature ended up being
 *     pretty weird. Since we don't know how it's being used, and since any
 *     of the parameters can be omitted, it ended up like this. Going forward,
 *     it would be good if we could remove this.
 *
 * @exports normalizeEventArguments
 * @param {string} [stream] - the Lytics stream name
 * @param {Object} [data] - the payload to collect
 * @param {boolean} [mock] - is it a mock send
 * @param {Function} [callback] - a callback to call once the message is
 *     processed
 * @returns {Object} the normalized message hash
 */
export default function normalizeEventArguments(args) {
  var stream,
    data,
    callback;

  forEach(args, function(arg) {
    switch (typeof arg) {
      case 'string':
        stream = arg;
        break;
      case 'function':
        callback = arg;
        break;
      case 'object':
        data = arg;
        break;
      case 'boolean':
        deprecation('boolean argument is passed to send. Ignoring.');
        break;
      default:
        throw new TypeError(
          'unable to process jstag.send event: ' +
          'unknown value type (' + typeof arg + ')'
        );
    }
  });

  if (data == null) {
    data = {};
  }

  return {
    stream: stream,
    data: data,
    callback: callback
  };
}
