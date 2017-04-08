import once from '../../util/once';
import appendQuery from '../../util/append-query';
import later from '../../timers/later';

/**
 * @constructor GifTransport
 * @private
 * @todo fix documentation
 * @todo add a description
 */
export default function GifTransport(config) {
  return {
    name: 'Gif',

    send: function GifTransport$send(url, message) {
      var image = new Image();
      var callback = once(message.callback);

      image.onload = callback;
      later(callback, config.delay);

      image.src = appendQuery(url, message.dataMsg);
    }
  };
}
