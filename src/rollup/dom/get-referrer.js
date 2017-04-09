/** @module jstag/dom/get-referrer */
import attempt from '../util/attempt';
import top from './top';
import parent from './parent';
import document from './document';

/**
 * @exports getReferrer
 * @returns {string} the referrer URL for the current document
 */
export default function getReferrer() {
  return attempt(
    function() { return top.document.referrer; },
    function() { return parent.document.referrer; },
    function() { return document.referrer; }
  );
}
