/**
 * @private
 * @param {Function} callback
 * @returns {Function} a wrapper callback that will allow the original
 *     callback to be called, at most, one time.
 */
export default function once(callback) {
  return function() {
    if (callback != null) {
      callback.apply(null, arguments);
      callback = null;
    }
  };
}
