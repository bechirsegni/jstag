import uid from './uid';

/**
 * Callback with a new ID
 *
 * @private
 * @param callback
 */
export default function makeId(callback) {
  callback(uid());
}
