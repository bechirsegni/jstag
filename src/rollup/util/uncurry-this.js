/**
 * @private
 * @param method {Function} - method that uses `this`
 * @returns {Function} function that allows the method's `this` parameter to
 *     be passed as a normal function parameter
 */
export default function uncurryThis(method) {
  return function func() {
    return method.apply(arguments[0], [].slice.call(arguments, 1));
  };
}
