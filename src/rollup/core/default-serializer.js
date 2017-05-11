/** @module jstag/core/default-serializer */
import encodeURIComponent from '../dom/encode-uri-component';
import isObject from '../util/is-object';
import isArray from '../util/is-array';
import isFunction from '../util/is-function';
import isString from '../util/is-string';
import forEach from '../util/for-each';
import keys from '../util/keys';

/**
 * Prepare a message object for flight over the wire
 *
 * @exports defaultSerializer
 * @param {Object} message
 * @param {string} namespace
 */
export default function defaultSerializer(data, namespace) {
  namespace || (namespace = '');
  var result = [];

  if (!isObject(data)) {
    result.push(namespace + '=' + data);
  } else if (isArray(data)) {
    result.push(
      namespace + '_len=' + data.length,
      namespace + '_json=' + encodeURIComponent(JSON.stringify(data))
    );
    forEach(data, function(datum) {
      result.push(defaultSerializer(datum, namespace));
    });
  } else {
    forEach(keys(data), function(plainKey) {
      var key = encodeURIComponent(plainKey);
      var datum = data[plainKey];

    // Don't attempt to serialize functions
      if (isFunction(datum)) { return; }

      if (namespace !== '') {
        key = [ namespace, key ].join('.');
      }
      if (isObject(datum)) {
        result.push(defaultSerializer(datum, key));
      } else if ((isString(datum) && datum.length > 0) || datum != null) {
        result.push(key + '=' + encodeURIComponent(datum));
      }
    });
  }
  return result.join('&');
}
