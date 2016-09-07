(function iife(window) {
  'use strict';

  if (!window.__lytics__jstag__) {
    throw new Error('jstag not defined');
  }

  var JSTag = window.__lytics__jstag__.JSTag;
  var util = window.__lytics__jstag__.util;

  util.expose([ 'bind', 'unbind' ]);

  util.extend(JSTag.prototype, {
    bind: function jstagBind(event, listener, options) {
      assertValidEvent(event);

      this.listeners[event] || (this.listeners[event] = []);
      this.listeners[event].push([ listener, options ]);
      return this;
    },

    unbind: function jstagUnbind(event, listener, options) {
      assertValidEvent(event);

      if (!this.listeners[event]) {
        return this;
      }
      this.listeners[event] = util.filter(this.listeners[event], function(tuple) {
        return tuple[0] !== listener && tuple[1] !== options;
      });
      return this;
    },

    emit: function jstagEmit(event) {
      assertValidEvent(event);

      var listeners = this.listeners[event] || [];
      var onceOnly = [];
      var args = [].slice.call(arguments, 1);

      if (!listeners || listeners.length === 0) {
        return this;
      }
      util.forEach(listeners, function(tuple) {
        var listener = tuple[0];
        var options = tuple[1];

        if (options && options.onetime) {
          onceOnly.push(tuple);
        }
        listener.apply(null, args);
      });
      this.listeners[event] = util.filter(listeners, function(tuple) {
        return !util.contains(onceOnly, tuple);
      });
      return this;
    },

  // Event handlers
    onIoReady: eventHandler('io.ready'),

    onSendStarted: eventHandler('send.before'),

    onSendFinished: eventHandler('send.finished')
  });

  function eventHandler(eventName) {
    return function handler() {
      return this.emit.apply(this, [ eventName ].concat(arguments));
    };
  }

  function assertValidEvent(eventName) {
    switch (eventName) {
      case 'io.ready':
      case 'send.before':
      case 'send.finished':
        return;
      default:
        throw new TypeError('unknown event: ' + eventName);
    }
  }
}(window));
