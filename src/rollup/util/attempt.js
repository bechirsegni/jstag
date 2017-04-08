/**
 * Wrapper around try-catch to isolate deoptimization
 *
 * @param {...Function} functions that may throw, to be executed lazily
 */
export default function attempt() {
  var err = null;

  for (var i = 0, len = arguments.length; i < len; i++) {
    try {
      return arguments[i](err);
    } catch (e) {
      err = e;
    }
  }
}
