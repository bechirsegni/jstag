/** @module jstag/core/block */
import isNumber from '../util/is-number';
import later from '../timers/later';

/**
 * @exports block
 * @method
 * @returns {JSTag} the instance
 * @todo add a description
 */
export default function block(timeout) {
  if (this.blocked) {
    return this;
  }
  var that = this;

// this.config.blockload exists for backwards compatibility
  this.blocked = this.config.blockload = true;

  if (!isNumber(timeout)) {
    timeout = 2000;
  }
  later(function() { that.unblock(); }, timeout);
  return this;
}
