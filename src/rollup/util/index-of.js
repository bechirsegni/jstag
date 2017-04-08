/**
 * [compat 5] Internet Explorer doesn't implement `[].indexOf` :facepalm: :facepalm: :facepalm:
 * @todo add a description
 */
export default function indexOf(collection, item) {
  for (var i = 0, len = collection.length; i < len; i++) {
    if (collection[i] === item) {
      return i;
    }
  }
  return -1;
}
