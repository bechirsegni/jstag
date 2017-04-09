import document from '../../dom/document';
import hyper from '../../dom/hyper';
import asap from '../../timers/asap';
import later from '../../timers/later';
import attempt from '../../util/attempt';
import isFunction from '../../util/is-function';
import uid from '../../util/uid';

/**
   * @constructor transports.Form
   * @private
   * @todo fix documentation
   * @todo add a description
   */
export default function FormTransport(config) {
  return {
    name: 'Form',

    send: function FormTransport$send(url, message) {
      var iframe = hyper('iframe', { id: uid() });
      iframe.style.display = 'none';

      document.body.appendChild(iframe);
      asap(function() {
        var childDocument = iframe.contentWindow.document;

        var form = hyper('form', {
          action: url,
          method: 'post'
        }, childDocument);

        var input = hyper('input', {
          value: message.dataMsg,
          type: 'hidden',
          name: '_js'
        }, childDocument);

        form.appendChild(input);
        childDocument.body.appendChild(form);

        form.submit();

        later(function() {
          attempt(function() { document.body.removeChild(iframe); });

          if (isFunction(message.callback)) {
            message.callback();
          }
        }, config.delay);
      });
    }
  };
}
