/** @module jstag/dom/get-uri-origin */
/**
 * @exports getUriOrigin
 * @todo add a description
 */
export default function getUriOrigin(uri) {
  return uri.protocol + '//' + uri.hostname + (uri.port ? ':' + uri.port : '');
}
