/**
 * Call a fn for every item in a collection
 *
 * @public
 * @param {Array} collection - the collection to be iterated
 * @param {Function} callback - the fn to call for each item in the array
 */
export default function forEach(collection, callback) {
  for (var i = 0, len = collection.length; i < len; i++) {
    callback(collection[i], i, collection);
  }
}
