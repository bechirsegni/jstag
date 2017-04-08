/**
 * @private
 * @param {Object} config - the JSTag configuration object
 * @param {string} config.url - the base URL for the endpoint
 * @param {string} cid - the cid for the collection endpoint
 * @param {string} [config.path]
 * @param {string} [config.idpath]
 * @param {string} [pathKey=path] - the config key for the path
 * @returns the endpoint URL
 */
export default function getEndpoint(config, cid, pathKey) {
  return '' + config.url + config[pathKey || 'path'] + cid;
}
