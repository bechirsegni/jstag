/** @module jstag/timers/later */
import arraySlice from '../util/array-slice';
import timers from './timers';

/**
 * Invoke a function after n milliseconds, and cache the timeout id
 *
 * @exports later
 * @param {Function} callback
 * @param {number} delay in milliseconds
 * @param {...any} additional params
 * @returns {number} the timer id for the new timeout
 */
export default function later(callback, delay) {
  var args = arraySlice(arguments, 2);

  // [compat 3] setTimeout.apply doesn't exist in IE :facepalm:
  var timer = setTimeout(function() { callback.apply(null, args); }, delay);

  timers.push(timer);
  return timer;
}
