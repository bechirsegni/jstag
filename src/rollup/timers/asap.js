import later from './later';
import arraySlice from '../util/array-slice';

/**
 * Invoke a callback on a future turn on the event loop
 *
 * @private
 * @param {Function} callback - the function to invoke
 * @todo feature-detect for more-performant implementation techniques
 */
export default function asap(callback) {
  var args = arraySlice(arguments, 1);

// should we feature detect for other techniques?
  later.apply(null, [ callback, 0 ].concat(args));
}
