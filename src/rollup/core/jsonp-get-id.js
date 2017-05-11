/** @module jstag/core/jsonp-get-id */
import getEndpoint from './get-endpoint';

/**
 * Retrieve an ID via JSONP
 *
 * @exports jsonpGetId
 * @param {JSTag} context
 * @param {Function} callback
 */
export default function jsonpGetId(context, callback) {
  var config = context.config;
  var idUri = getEndpoint(config, config.cid[0], 'idpath');

  context.jsonp(idUri, callback);
}
