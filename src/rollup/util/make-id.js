/** @module jstag/util/make-id */
import uid from './uid';

/**
 * Callback with a new ID
 *
 * @exports makeId
 * @param callback
 */
export default function makeId(callback) {
  callback(uid());
}
