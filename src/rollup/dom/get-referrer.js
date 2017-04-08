import attempt from '../util/attempt';
import top from './top';
import parent from './parent';
import document from './document';

/**
 * @private
 * @returns {string} the referrer URL for the current document
 */
export default function getReferrer() {
  return attempt(
    function() { return top.document.referrer; },
    function() { return parent.document.referrer; },
    function() { return document.referrer; }
  );
}
