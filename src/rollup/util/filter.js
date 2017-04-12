/** @module jstag/util/filter */
import reduce from './reduce';

/**
 * @exports filter
 * @param {Array.<any>} collection
 * @param {Function} predicate
 * @returns {Array.<any>} the collection filtered by the predicate
 */
export default function filter(collection, predicate) {
  return reduce(collection, function(memo, element, i) {
    if (predicate(element, i, collection)) {
      memo.push(element);
    }
    return memo;
  }, []);
}
