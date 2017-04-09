/** @module jstag/util/extend */
import arraySlice from './array-slice';
import reduce from './reduce';
import forEach from './for-each';
import keys from './keys';
import isBoolean from './is-boolean';
import isObject from './is-object';

/**
 * Extend an object, optionally using a deep merge
 *
 * @exports extend
 * @param {boolean} [isDeep] - extend using deep-merge semantics
 * @param {Object} target - the object to copy params to
 * @param {...Object} sources - the objects to copy properties from
 * @returns target
 */
export default function extend() {
  var sources = arraySlice(arguments);
  var isDeep = false;

  if (isBoolean(sources[0])) {
    isDeep = true;
    sources = sources.slice(1);
  }
  return reduce(sources, function(target, source) {
    if (source === undefined) {
      return target;
    }
    forEach(keys(source), function(key) {
      if (isDeep && isObject(source[key])) {
        target[key] = extend(true, target[key], source[key]);
      } else {
        target[key] = source[key];
      }
    });
    return target;
  });
}
