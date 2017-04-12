/** @module jstag/util/filter-object */
import object from './object';
import filter from './filter';
import pairs from './pairs';

/**
 * Return a new object whose key-value pairs are not filtered by the predicate
 *
 * @exports filterObject
 * @param {Object} source - the object to filter
 * @param {Function} predicate - the function used to test each key-value pair
 * @param {Object} a new object with only the key-value pairs which pass the
 *     predicate function
 */
export default function filterObject(source, predicate) {
  return object(filter(pairs(source), predicate));
}
