/** @module jstag/util/reduce */
/**
 * @exports reduce
 * @param {Array.<any>} collection
 * @param {Function} combine
 * @param {any} memo
 * @returns {Array.<any>} the reduced value of the collection
 */
export default function reduce(collection, combine, memo) {
  var i = -1;
  var len = collection.length;

  if (arguments.length === 2 && len) {
    memo = collection[++i];
  }
  while (++i < len) {
    memo = combine(memo, collection[i], i, collection);
  }
  return memo;
}
