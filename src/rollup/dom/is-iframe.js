/** @module jstag/dom/is-iframe */
import window from '../dom/window';
import attempt from '../util/attempt';

/**
 * Whether the current window is in an iframe
 *
 * @exports isIFrame
 */
export default function isIFrame() {
  return attempt(
    function() { return window.self !== window.top; },
    function() { return true; }
  );
}
