/** @module jstag/util/keys */
import filter from './filter';
import allKeys from './all-keys';

/**
 * A polyfill for Object.keys
 * @exports keys
 */
export default Object.keys || function keys(source) {
  return filter(allKeys(source), function(key) {
    return {}.hasOwnProperty.call(source, key);
  });
};
