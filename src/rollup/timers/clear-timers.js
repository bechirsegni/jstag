/** @module jstag/timers/clear-timers */
import forEach from '../util/for-each';
import timers from './timers';

/**
 * Clear all currently-cached timeouts and empty the timeout cache
 * @exports clearTimers
 */
export default function clearTimers() {
  forEach(timers, clearTimeout);
  timers.length = 0;
}
