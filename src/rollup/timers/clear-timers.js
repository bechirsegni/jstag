import forEach from '../util/for-each';
import timers from './timers';

/**
 * Clear all currently-cached timeouts and empty the timeout cache
 */
export default function clearTimers() {
  forEach(timers, clearTimeout);
  timers.length = 0;
}
