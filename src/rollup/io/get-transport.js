import FormTransport from './transports/form';
import GifTransport from './transports/gif';

/**
 * @private
 * @method
 * @param {Object} message
 * @param {string} url
 * @todo add a description
 */
export default function ioGetTransport(message, url) {
  var config = this.config;

  if (message.dataMsg.length + url.length > 2000) {
    return new FormTransport(config);
  }
  return new GifTransport(config);
}
