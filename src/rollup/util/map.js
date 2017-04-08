import reduce from './reduce';

/**
 * @public
 * @param {Array.<any>} collection
 * @param {Function} transform
 * @returns {Array.<any>} the collection mapped by the mapper
 */
export default function map(collection, transform) {
  return reduce(collection, function(memo, item, i) {
    memo.push(transform(item, i, collection));
    return memo;
  }, []);
}
