/** @module jstag/core/unblock */
import forEach from '../util/for-each';

/**
 * @exports unblock
 * @method
 * @returns {JSTag} the instance
 * @todo add a description
 */
export default function unblock() {
  if (!this.blocked) {
    return this;
  }
  var that = this;

// this.config.blockload exists for backwards compatibility
  this.blocked = this.config.blockload = false;

  forEach(this.config.payloadQueue, function(message) {
    that.sendMessage(message);
  });

  this.config.payloadQueue.length = 0;
  return this;
}
