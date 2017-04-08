import document from '../dom/document';

/**
 * Get a cookie value, which can be of any serializable type
 *
 * @private
 * @param {string} name
 * @returns {any} - the stored value
 */
export default function getCookie(name) {
  var re = new RegExp(name + '=([^;]+)');
  var value = re.exec(decodeURIComponent(document.cookie));

  return value && value[1];
}
