import filter from './filter';
import allKeys from './all-keys';

/**
 * A polyfill for Object.keys
 * @todo write docs
 */
export default Object.keys || function keys(source) {
  return filter(allKeys(source), function(key) {
    return {}.hasOwnProperty.call(source, key);
  });
};
