/** @module jstag/core/jsonp-get-id */
import getEndpoint from './get-endpoint';
import forEach from '../util/for-each';
import arraySlice from '../util/array-slice';

/**
 * Retrieve an ID via JSONP
 *
 * @exports jsonpGetId
 * @param {JSTag} context
 * @param {Function} callback
 */
export default function jsonpGetId(context, callback) {
  if (context._pendingGetId) {
    context._pendingGetId.push(callback);
  } else {
    context._pendingGetId = [ callback ];

    var config = context.config;
    var idUri = getEndpoint(config, config.cid[0], 'idpath');

    context.jsonp(idUri, function() {
      var args = arraySlice(arguments);
      var pending = context._pendingGetId;

      context._pendingGetId = null;

      forEach(pending, function(pendingCallback) {
        pendingCallback.apply(context, args);
      });
    });
  }
}
