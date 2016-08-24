(function iife(window, undefined) {
  'use strict';

  var location = window.location;
  var document = window.document;
  var navigator = window.navigator;
  var screen = window.screen;
  var userAgent = navigator.userAgent;
  var ioVersion = '2.0.0';
  var JSTAG1 = 'jstag1';
  var arraySlice = uncurryThis([].slice);
  var keys = Object.keys || function keys(source) {
    return filter(allKeys(source), function(key) {
      return {}.hasOwnProperty.call(source, key);
    });
  };

  function getConfig(config) {
    var mergedConfig = extend({
      url: '//c.lytics.io',
      location: location.href,
      payloadQueue: [],
      id: undefined,
      cid: undefined,
      loadid: undefined,
      serializer: defaultSerializer,
      delay: 2000,
      blockload: false,
      path: '/c/',
      idpath: '/cid/',
      cookie: 'seerid',
      sesname: 'seerses',
      stream: undefined,
      sessecs: 1800,
      qsargs: [],
      ref: true,
      tagid: 'jstag-csdk',
      pagedata: {},
      version: ioVersion
    }, config);

    if (mergedConfig.cid) {
    // normalize `cid` so that it's always an array:
      mergedConfig.cid = [].concat(mergedConfig.cid);
    }

    return mergedConfig;
  }

  var transports = {
  /**
   * @constructor transports.Gif
   * @private
   * @todo fix documentation
   * @todo add a description
   */
    Gif: function GifTransport(config) {
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
    },

  /**
   * @constructor transports.Form
   * @private
   * @todo fix documentation
   * @todo add a description
   */
    Form: function FormTransport(config) {
      return {
        name: 'Form',

        send: function FormTransport$send(url, message) {
          var iframe = html('iframe', { id: uid() });
          iframe.style.display = 'none';

          document.body.appendChild(iframe);
          asap(function() {
            var childDocument = iframe.contentWindow.document;

            var form = html('form', {
              action: url,
              method: 'post'
            }, childDocument);

            var input = html('input', {
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
  };

/**
 * @private
 * @constructor JSTag
 * @param {Object} config
 * @todo document all config options
 */
  function JSTag(config) {
    this.config = getConfig(config);
    this.referrer = getReferrer();
    this.pageData = {};
    this.blocked = false;
    this.changeId = null;
    /** @deprecated */this.listeners = {};
  }

  JSTag.prototype = {
    constructor: JSTag,

  /**
   * @public
   * @method
   * @todo add a description
   */
    getid: function getid(callback) {
      var that = this;
      var wrappedCallback = once(function(id) {
        that.setid(id);
        callback(id);
      });
      var seerId = getCookie(this.config.cookie);

      if (seerId && seerId.length) {
        asap(wrappedCallback, seerId);
      } else if (this.config.loadid) {
        asap(jsonpGetId, this, wrappedCallback);
      } else {
        asap(makeId, wrappedCallback);
      }
    },

  /**
   * @public
   * @method
   * @todo add a description
   */
    setid: function setid(id) {
      var cookieName = this.config.cookie;
      var oldId = getCookie(cookieName);
      if (oldId && oldId.length) {
        this.changeId = oldId;
      }
      setCookie(cookieName, id);
    },

  /**
   * Clears both cookies by name
   *
   * @public
   * @method
   */
    clearCookies: function clearCookies() {
      deleteCookie(this.config.cookie);
      deleteCookie(this.config.sesname);
    },

  /**
   * @public
   * @method
   * @param {string} [stream] - the Lytics stream name
   * @param {Object} [data] - the payload to collect
   * @param {Function} [callback] - a callback to call once the message is
   *     processed
   * @returns the normalized options hash
   * @todo add a description
   */
    parseEvent: function parseEvent() {
      var args = arraySlice(arguments);

      return normalizeEventArgs(args);
    },

  /**
   * @public
   * @method
   * @returns {JSTag} the instance
   * @todo add a description
   */
    block: function block(timeout) {
      if (this.blocked) {
        return this;
      }
      var that = this;

    // this.config.blockload exists for backwards compatibility
      this.blocked = this.config.blockload = true;

      if (!isNumber(timeout)) {
        timeout = 2000;
      }
      later(function() { that.unblock(); }, timeout);
      return this;
    },

  /**
   * @public
   * @method
   * @returns {JSTag} the instance
   * @todo add a description
   */
    unblock: function unblock() {
      if (!this.blocked) {
        return this;
      }
      var that = this;

    // this.config.blockload exists for backwards compatibility
      this.blocked = this.config.blockload = false;

      forEach(this.config.payloadQueue, function(message) {
        that.sendMessage(message);
      });

      this.config.payloadQueue.length = 0;
      return this;
    },

  /**
   * Send a message
   *
   * @private
   * @param {Object} the message to send
   * @param {boolean} isMock if passed, don't actually do any I/O
   * @throws {TypeError}
   */
    sendMessage: function sendMessage(message, isMock) {
      isMock == null && (isMock = false);
      var that = this;
      var config = this.config;

      if (!config.url || !config.cid) {
        throw new TypeError('Must have collection url and ProjectIds (cid)');
      }
      if (this.blocked && !isMock) {
        config.payloadQueue.push(message);
        return;
      }
      if (isMock) {
        if (message.callback == null) {
          throw new TypeError('cannot call mock without a callback');
        }

        var memo = message.data;

        forEach(config.payloadQueue, function(item) {
          extend(memo, item.data);
        });
      }
      message.stream || (message.stream = config.stream);
      forEach(this.config.cid, function(cid) {
        var url = getEndpoint(config, cid) + (message.stream ? '/' + message.stream : '');

        // [compat 6] Internet Explorer has no `Array.prototype.indexOf`, so
        //     `contains` can't be generic. Just use `String.prototype.indexOf`
        if (url.indexOf('_uidn=') === -1 && config.cookie !== 'seerid') {
          url = appendQuery(url, '_uidn=' + config.cookie);
        }

        message.data._ts = now();

        collectIdentity(message, config, that);

        that.getid(function(id) {
          if (message.data._uid != null) {
          // In an ideal world, we'd prevent the user from overwriting `_uid`. Warn for now
            deprecation('user passed `_uid`');
          }
          if (id && !message.data._uid) {
            message.data._uid = id;
            message.data._getid = 't';
          }
          that.ioCollect(message, url, isMock);
        });
      });
    },

  /**
   * @private
   * @method
   * @param {Object} message
   * @param {string} url
   * @param {boolean} isMock
   * @todo add a description
   */
    ioCollect: function ioCollect(message, url, isMock) {
      var that = this;
      var config = this.config;

      this.onSendStarted(message);

      message.data._ca = JSTAG1;
      message.dataMsg = config.serializer(extend({}, message.data));
      message.sendurl || (message.sendurl = []);
      message.sendurl.unshift(url);

      if (isMock) {
        asap(message.callback, message, this);
        return;
      }

      var transport = this.ioGetTransport(message, url);
    // NOTE: this seems unnecessary, and exists only for backwards compatibility.
      message.channelName = transport.name;

      transport.send(url, extend({}, message, {
        callback: function collectCallback() {
          if (isFunction(message.callback)) {
            message.callback(message, that);
          }
          that.onSendFinished(message);
        }
      }));
    },

  /**
   * @private
   * @method
   * @param {Object} message
   * @param {string} url
   * @todo add a description
   */
    ioGetTransport: function ioGetTransport(message, url) {
      var config = this.config;

      if (message.dataMsg.length + url.length > 2000) {
        return new transports.Form(config);
      }
      return new transports.Gif(config);
    },
  /**
   * @public
   * @method
   * @param {string} [stream] - the Lytics stream name
   * @param {Object} [data] - the payload to collect
   * @param {Function} [callback] - a callback to call once the message is
   *     processed
   * @todo add a description
   */
    send: send,
    identify: send,

  /**
   * @public
   * @method
   * @param {string} [stream] - the Lytics stream name
   * @param {Object} [data] - the payload to collect
   * @param {Function} [callback] - a callback to call once the message is
   * @todo add a description
   */
    mock: mock,

  /**
   * @public
   * @method
   * @param {string} [stream] - the Lytics stream name
   * @param {Object} [data] - the payload to collect
   * @param {Function} [callback] - a callback to call once the message is
   *     processed
   * @todo add a description
   */
    page: page,
    pageView: page,

  /**
   * @public
   * @method
   * @todo add a description
   */
    pageAnalysis: function pageAnaylsis() {
      var config = this.config;
      var sessionCookie = getCookie(config.sesname);
      var pageData = this.pageData;
      var uri = parseUri(config.location);

      if (uri.search.length > 0) {
        var queryParams = parseQueryString(uri.search);

      // `utm_` prefixes are generic tracking-related parameters
        extend(pageData, filterObject(queryParams, function(tuple) {
          return startsWith(tuple[0], 'utm_');
        }));

        if (config.qsargs && config.qsargs.length > 0) {
          extend(pageData, filterObject(queryParams, function(tuple) {
            return contains(config.qsargs, tuple[0]);
          }));
        }
      }

      if (!sessionCookie) {
        pageData._sesstart = '1';
      }

      var referrer = this.referrer;

      if (referrer && referrer.length > 0) {
        var referrerHost = /\/\/(.*)\//.exec(referrer);

        if (referrerHost && !contains(referrerHost[1], location.host)) {
          var strippedReferrer = stripProtocol(referrer);

          pageData._ref = strippedReferrer;

          if (!sessionCookie) {
            pageData._sesref = strippedReferrer;
          }
        }
      }

      setCookie(config.sesname, 'e', config.sessecs);

      pageData._tz = parseInt(-new Date().getTimezoneOffset() / 60, 10);
      pageData._ul = navigator.language || navigator.userLanguage;

      if (screen) {
        pageData._sz = screen.width + 'x' + screen.height;
      }
      this.pageData = pageData;
    },

  /**
   * Make a JSONP request
   *
   * @param {string} url
   * @param {Function} callback
   */
    jsonp: function jsonp(url, callback) {
      var callbackId = uid();
      var script = html('script', { src: appendQuery(url, 'callback=' + callbackId) });

      window[callbackId] = once(function() {
        window[callbackId] = undefined;
        attempt(function() { document.body.removeChild(script); });
        script = undefined;
        callback.apply(null, arguments);
      });

      document.body.appendChild(script);
    },

  /**
   * Extend an object, optionally using a deep merge
   *
   * @public
   * @method
   * @param {boolean} [isDeep] - extend using deep-merge semantics
   * @param {Object} target - the object to copy params to
   * @param {...Object} sources - the objects to copy properties from
   * @returns target
   */
    extend: extend,

  /**
   * Parse a URI using the browser's native capabilities
   *
   * @public
   * @method
   * @param {string} uri
   * @returns {Object} the parsed uri
   */
    parseUri: parseUri,

  /**
   * Parse a query string
   *
   * @public
   * @method
   * @param {string} queryString
   * @returns {Object} the parsed query string
   */
    parseQueryString: parseQueryString,

  /**
   * Get a cookie value, which can be of any serializable type
   *
   * @public
   * @method
   * @param {string} name
   * @returns {any} - the stored value
   */
    getCookie: getCookie,

  /**
   * Set a cookie with a value of any serializable type
   *
   * @public
   * @method
   * @param {string} name - the cookie name
   * @param {any} value - the cookie value
   * @param {number} seconds - the seconds until expiration relative from now
   */
    setCookie: setCookie,

  /**
   * Delete a cookie
   *
   * @public
   * @method
   * @param {string} name
   */
    deleteCookie: deleteCookie,

  /**
   * @event
   */
    onIoReady: noop,

  /**
   * @event
   */
    onSendStarted: noop,

  /**
   * @event
   */
    onSendFinished: noop
  };

  function send() {
    var args = arraySlice(arguments);

    this.sendMessage(normalizeEventArgs(args));
  }

  function page() {
    var args = arraySlice(arguments);
    var message = normalizeEventArgs(args);

    message.data = extend({ _e: 'pv' }, this.pageData, message.data);

    this.sendMessage(message);
  }

  function mock() {
    var args = arraySlice(arguments);
    var message = normalizeEventArgs(args);

    message.data = extend({ _e: 'mk' }, this.pageData, message.data);

    this.sendMessage(message, true);
  }

  function collectIdentity(message, config, instance) {
    var data = message.data;

    if (isMobile()) {
      data._mob = 't';
      var mobType = 'unknown';
      if (/Android/i.test(userAgent)) {
        mobType = 'Android';
      } else if (/BlackBerry/i.test(userAgent)) {
        mobType = 'Blackberry';
      } else if (/iPhone|iPad|iPod/i.test(userAgent)) {
        mobType = 'IOS';
      } else if (/IEMobile/i.test(userAgent)) {
        mobType = 'WinMobile';
      }
      data._device = mobType;
    } else {
      data._nmob = 't';
      data._device = 'desktop';
    }

  // get location
    data.url = stripProtocol(location.href);

    if (isIFrame()) {
      data._if = 't';
    }

  // clean up uid
    if ('_uid' in data && !data._uid) {
      delete data._uid;
    }

  // collect google analytics entropy:
    var googleAnalyticsCookie = getCookie('__utma');

  // this is here to support an experiment with collecting potentially
  //     user-identifying entropy
    if (googleAnalyticsCookie && googleAnalyticsCookie.length > 10) {
      data._ga = googleAnalyticsCookie.substring(0, googleAnalyticsCookie.indexOf('.', 10));
    }

    if (!('_uid' in data)) {
      var seerId = getCookie(config.cookie);
      if (seerId && seerId.length) {
        data._uid = seerId;
      }
    }

    var optimizelyCookie = getCookie('optimizelyEndUserId');

    if (optimizelyCookie) {
      data.optimizelyid = optimizelyCookie;
    }

    if (!('_v' in data)) {
      data._v = ioVersion;
    }

    if (instance && instance.changeId) {
      data._uido = instance.changeId;
    }
  }

/**
 * Prepare a message object for flight over the wire
 *
 * @private
 * @param {Object} message
 * @param {string} namespace
 */
  function defaultSerializer(data, namespace) {
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

  function html(elementName, properties, doc) {
    doc || (doc = window.document);
    return extend(doc.createElement(elementName), properties);
  }

/**
 * Wrapper around try-catch to isolate deoptimization
 *
 * @param {...Function} functions that may throw, to be executed lazily
 */
  function attempt() {
    var err = null;

    for (var i = 0, len = arguments.length; i < len; i++) {
      try {
        return arguments[i](err);
      } catch (e) {
        err = e;
      }
    }
  }

/**
 * Callback with a new ID
 *
 * @private
 * @param callback
 */
  function makeId(callback) {
    callback(uid());
  }

/**
 * Whether the current user agent is a mobile browser. Code borrowed from
 * detectmobilebrowsers.com
 *
 * @private
 */
  function isMobile() {
    var a = navigator.userAgent || navigator.vendor || window.opera;
    return /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4));
  }

/**
 * Whether the current window is in an iframe
 *
 * @private
 */
  function isIFrame() {
    return attempt(
      function() { return window.self !== window.top; },
      function() { return true; }
    );
  }

/**
 * @private
 * @member later.timers
 */
  var laterTimers = [];

/**
 * Clear all currently-cached timeouts and empty the timeout cache
 */
  function clearTimers() {
    forEach(laterTimers, clearTimeout);
    laterTimers.length = 0;
  }

/**
 * Invoke a function after n milliseconds, and cache the timeout id
 *
 * @private
 * @param {Function} callback
 * @param {number} delay in milliseconds
 * @param {...any} additional params
 * @returns {number} the timer id for the new timeout
 */
  function later(callback, delay) {
    var args = arraySlice(arguments, 2);

    // [compat 3] setTimeout.apply doesn't exist in IE :facepalm:
    var timer = setTimeout(function() { callback.apply(null, args); }, delay);

    laterTimers.push(timer);
    return timer;
  }

/**
 * Invoke a callback on a future turn on the event loop
 *
 * @private
 * @param {Function} callback - the function to invoke
 * @todo feature-detect for more-performant implementation techniques
 */
  function asap(callback) {
    var args = arraySlice(arguments, 1);

  // should we feature detect for other techniques?
    later.apply(null, [ callback, 0 ].concat(args));
  }

/**
 * Extend an object, optionally using a deep merge
 *
 * @private
 * @param {boolean} [isDeep] - extend using deep-merge semantics
 * @param {Object} target - the object to copy params to
 * @param {...Object} sources - the objects to copy properties from
 * @returns target
 */
  function extend() {
    var sources = arraySlice(arguments);
    var isDeep = false;

    if (isBoolean(sources[0])) {
      isDeep = true;
      sources = sources.slice(1);
    }
    return reduce(sources, function(target, source) {
      if (source === undefined) {
        return target;
      }
      forEach(keys(source), function(key) {
        if (isDeep && isObject(source[key])) {
          target[key] = extend(true, target[key], source[key]);
        } else {
          target[key] = source[key];
        }
      });
      return target;
    });
  }

/**
 * Retrieve an ID via JSONP
 *
 * @private
 * @param {JSTag} context
 * @param {Function} callback
 */
  function jsonpGetId(context, callback) {
    var config = context.config;
    var idUri = getEndpoint(config, config.cid[0], 'idpath');

    context.jsonp(idUri, callback);
  }

  /**
   * @private
   * @returns {string} the referrer URL for the current document
   */
  function getReferrer() {
    return attempt(
      function() { return top.document.referrer; },
      function() { return parent.document.referrer; },
      function() { return document.referrer; }
    );
  }

  /**
   * @private
   * @param {string} url
   * @returns {string} a string containing the URL with the protocol removed
   */
  function stripProtocol(url) {
    return url.replace(/^https?:\/\//, '');
  }

/**
 * @private
 * @param {Function} callback
 * @returns {Function} a wrapper callback that will allow the original
 *     callback to be called, at most, one time.
 */
  function once(callback) {
    return function() {
      if (callback != null) {
        callback.apply(null, arguments);
        callback = null;
      }
    };
  }

/**
 * Call a fn for every item in a collection
 *
 * @public
 * @param {Array} collection - the collection to be iterated
 * @param {Function} callback - the fn to call for each item in the array
 */
  function forEach(collection, callback) {
    for (var i = 0, len = collection.length; i < len; i++) {
      callback(collection[i], i, collection);
    }
  }

  /**
   * [compat 5] Internet Explorer doesn't implement `[].indexOf` :facepalm: :facepalm: :facepalm:
   * @todo document
   */
  function indexOf(collection, item) {
    for (var i = 0, len = collection.length; i < len; i++) {
      if (collection[i] === item) {
        return i;
      }
    }
    return -1;
  }

/**
 * @public
 * @param {Array.<any>} collection
 * @param {Function} combine
 * @param {any} memo
 * @returns {Array.<any>} the reduced value of the collection
 */
  function reduce(collection, combine, memo) {
    var i = -1;
    var len = collection.length;

    if (arguments.length === 2 && len) {
      memo = collection[++i];
    }
    while (++i < len) {
      memo = combine(memo, collection[i], i, collection);
    }
    return memo;
  }

/**
 * @public
 * @param {Array.<any>} collection
 * @param {Function} transform
 * @returns {Array.<any>} the collection mapped by the mapper
 */
  function map(collection, transform) {
    return reduce(collection, function(memo, item, i) {
      memo.push(transform(item, i, collection));
      return memo;
    }, []);
  }

/**
 * @public
 * @param {Array.<any>} collection
 * @param {Function} predicate
 * @returns {Array.<any>} the collection filtered by the predicate
 */
  function filter(collection, predicate) {
    return reduce(collection, function(memo, element, i) {
      if (predicate(element, i, collection)) {
        memo.push(element);
      }
      return memo;
    }, []);
  }

/**
 * Return an array of all the key-value pairs of a given object
 *
 * @public
 * @param {Object}
 * @returns {Array.Array.<string>} an array of arrays of key-value pairs
 */
  function pairs(source) {
    return reduce(keys(source), function(memo, key) {
      memo.push([ key, source[key] ]);
      return memo;
    }, []);
  }

/**
 * Return an object from an array of arrays of key-value pairs
 *
 * @public
 * @param {Array.Array.<string>} an array of arrays of key-value pairs
 * @returns {Object} an object containing the specified keys and values
 */
  function object(source) {
    return reduce(source, function(memo, pair) {
      memo[pair[0]] = pair[1];
      return memo;
    }, {});
  }

/**
 * Return a new object whose key-value pairs are not filtered by the predicate
 *
 * @public
 * @param {Object} source - the object to filter
 * @param {Function} predicate - the function used to test each key-value pair
 * @param {Object} a new object with only the key-value pairs which pass the
 *     predicate function
 */
  function filterObject(source, predicate) {
    return object(filter(pairs(source), predicate));
  }

/**
 * Does this array-like `haystack` contain the given element `needle`. This
 *     is primarily designed to work with arrays and strings
 *
 * @public
 * @param {(string|Array.<*>)} haystack - the array-like to search in
 * @param {any} needle - the object to search for
 * @todo as written this is not generic in old browsers like IE
 */
  function contains(haystack, needle) {
    return indexOf(haystack, needle) !== -1;
  }

/**
 * Trim leading and trailing whitespace from a string
 *
 * @public
 * @param {string} str - a string that may have leading or trailing whitespace
 * @returns {string} the string without leading or trailing whitespace
 */
  function trim(str) {
    return str.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
  }

/**
 * Return true if the haystack string starts with the needle string
 *
 * @private
 * @param {string} haystack - a string to search in
 * @param {string} needle - a string to search for
 * @returns {string} the
 */
  function startsWith(haystack, needle) {
    return haystack.indexOf(needle) === 0;
  }

/**
 * Return all the keys of an object, including inherited properties. Chances are,
 * this thing'll get deoptimized.
 *
 * @private
 * @param {object} source - the object to extract keys from
 * @returns {string[]} the enumerable keys of the source, or any object on its
 *     prototype chain
 */
  function allKeys(obj) {
    var result = [];
    /* eslint-disable guard-for-in */
    for (var key in obj) {
      result.push(key);
    }
    /* eslint-enable guard-for-in */
    return result;
  }

/**
 * @private
 * @param {any} it
 * @returns {boolean}
 */
  function isFunction(it) {
    return 'function' === typeof it;
  }

/**
 * @private
 * @param {any} it
 * @returns {boolean}
 */
  function isBoolean(it) {
    return 'boolean' === typeof it;
  }

/**
 * @private
 * @param {any} it
 * @returns {boolean}
 */
  function isObject(it) {
    return it && 'object' === typeof it;
  }

/**
 * @private
 * @param {any} it
 * @returns {boolean}
 */
  function isArray(it) {
    return '[object Array]' === {}.toString.call(it);
  }

/**
 * @private
 * @param {any} it
 * @returns {boolean}
 */
  function isString(it) {
    return 'string' === typeof it;
  }

/**
 * @private
 * @param {any} it
 * @returns {boolean}
 */
  function isNumber(it) {
    return 'number' === typeof it;
  }

/**
 * Get a cookie value, which can be of any serializable type
 *
 * @private
 * @param {string} name
 * @returns {any} - the stored value
 */
  function getCookie(name) {
    var re = new RegExp(name + '=([^;]+)');
    var value = re.exec(decodeURIComponent(document.cookie));

  // @todo don't rely on try/catch to handle type errors (think: value == null)
    return attempt(function() { return JSON.parse(value[1]); });
  }

/**
 * Delete a cookie
 *
 * @private
 * @param {string} name
 */
  function deleteCookie(name) {
    setCookie(name, '', -60);
  }

/**
 * Set a cookie with a value of any serializable type
 *
 * @private
 * @param {string} name - the cookie name
 * @param {any} value - the cookie value
 * @param {number} seconds - the seconds until expiration relative from now
 */
  function setCookie(name, value, seconds) {
    seconds || (seconds = 90 * 24 * 60 * 60); // 90 days
    var expires = getExpirationDate(seconds);
    var domain = parseUri(location).hostname;
    var cookieValue = (
      name + '=' + encodeURIComponent(JSON.stringify(value)) +

      // Note: valid cookies must have at least 2 dots in the domain! [compat]
      (domain && domain.split('.').length > 1 ? '; domain=' + domain : '') +
      ('; expires=' + expires.toUTCString())
    );

    document.cookie = cookieValue;
  }

/**
 * @private
 * @param {number} seconds
 * @returns {Date} - a date object relative to now
 */
  function getExpirationDate(seconds) {
    var date = new Date();
    date.setTime(date.getTime() + 1000 * seconds);
    return date;
  }

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
  function getEndpoint(config, cid, pathKey) {
    return '' + config.url + config[pathKey || 'path'] + cid;
  }

/**
 * This method takes parameters in any order, and categorizes them based on
 *     their data type. It exists for backwards compatibility, because the
 *     parameters were added over time, and so this signature ended up being
 *     pretty weird. Since we don't know how it's being used, and since any
 *     of the parameters can be omitted, it ended up like this. Going forward,
 *     it would be good if we could remove this.
 *
 * @private
 * @param {string} [stream] - the Lytics stream name
 * @param {Object} [data] - the payload to collect
 * @param {boolean} [mock] - is it a mock send
 * @param {Function} [callback] - a callback to call once the message is
 *     processed
 * @returns {Object} the normalized message hash
 */
  function normalizeEventArgs(args) {
    var stream,
      data,
      callback;

    forEach(args, function(arg) {
      switch (typeof arg) {
        case 'string':
          stream = arg;
          break;
        case 'function':
          callback = arg;
          break;
        case 'object':
          data = arg;
          break;
        case 'boolean':
          deprecation('boolean argument is passed to send. Ignoring.');
          break;
        default:
          throw new TypeError('unable to process jstag.send event: unknown value type (' + typeof arg + ')');
      }
    });

    if (data == null) {
      data = {};
    }

    return {
      stream: stream,
      data: data,
      callback: callback
    };
  }

/**
 * @private
 * @param {string} url - the base URL to append to
 * @param {string} query - the query string to append
 * @returns {string} the url with the specified query param appended
 */
  function appendQuery(url, query) {
    return url + (contains(url, '?') ? '&' : '?') + query;
  }

/**
 * @private
 * @param method {Function} - method that uses `this`
 * @returns {Function} function that allows the method's `this` parameter to
 *     be passed as a normal function parameter
 */
  function uncurryThis(method) {
    return function func() {
      return method.apply(arguments[0], [].slice.call(arguments, 1));
    };
  }

/**
 * @private
 * @returns {Function} - The number of milliseconds since the UNIX epoch
 */
  function now() {
    return new Date().getTime();
  }

/**
 * @private
 * @returns {string} a fairly unique identifier
 */
  function uid() {
    return 'u_' + Math.floor(Math.random() * 1e18);
  }

/**
 * @private
 */
  function noop() {} noop();

  function deprecation(message) {
    /* eslint-disable no-console */
    console.warn('Deprecation warning: ' + message);
    /* eslint-enable no-console */
  }

/**
 * Parse a URI using the browser's native capabilities
 *
 * @private
 * @param {string} uri
 * @returns {Object} the parsed uri
 */
  function parseUri(uri) {
    var parser = html('a', { href: uri });
    var stringValueKeys = filter(allKeys(parser), function(key) {
      var value = attempt(function() {
        // [compat 2] This lookup can throw in Internet Explorer :sadtaco:
        return parser[key];
      });
      if (value == null) {
        return false;
      }
      return isString(value);
    });
    var parsed = object(map(stringValueKeys, function(key) {
      return [ key, parser[key] ];
    }));

    // [compat 1] Note: older browsers that don't support CORS won't have `origin`:
    if (parsed.origin == null) {
      parsed.origin = getUriOrigin(parsed);
    }
    return parsed;
  }

  function getUriOrigin(uri) {
    return uri.protocol + '//' + uri.hostname + (uri.port ? ':' + uri.port : '');
  }

/**
 * @private
 * @param {string} str - the query string to parse
 * @returns {Object} the parsed query string
 * @author Sindre Sorhus <sindresorhus@gmail.com>
 * @licence
 * The MIT License (MIT)
 *
 * Copyright (c) Sindre Sorhus <sindresorhus@gmail.com> (sindresorhus.com)
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
  function parseQueryString(str) {
    var ret = {};

    if ('string' !== typeof str) {
      return ret;
    }

    str = trim(str).replace(/^(\?|#|&)/, '');

    if (!str) {
      return ret;
    }

    forEach(str.split('&'), function(param) {
      var parts = param.replace(/\+/g, ' ').split('=');
    // Firefox (pre 40) decodes `%3D` to `=`
    // https://github.com/sindresorhus/query-string/pull/37
      var key = parts.shift();
      var val = parts.length > 0 ? parts.join('=') : undefined;

      key = decodeURIComponent(key);

    // missing `=` should be `null`:
    // http://w3.org/TR/2012/WD-url-20120524/#collect-url-parameters
      val = val === undefined ? null : decodeURIComponent(val);

      if (ret[key] === undefined) {
        ret[key] = val;
      } else if (isArray(ret[key])) {
        ret[key].push(val);
      } else {
        ret[key] = [ ret[key], val ];
      }
    });

    return ret;
  }

/**
 * @exports window.jstag
 */
  window.jstag || (window.jstag = {});
  window.jstag.JSTag = JSTag;
  window.jstag.init = (function facade() {
  // Cache for the backing singleton instance
    var instance;

    function expose(methodNames) {
      forEach(methodNames, function(methodName) {
        window.jstag[methodName] = function() {
          return instance[methodName].apply(instance, arguments);
        };
      });
    }

  // Expose the singleton facade interface
    expose([
      'send',
      'mock',
      'block',
      'unblock',
      'identify',
      'pageView',
      'parseEvent',
      'clearCookies'
    ]);

  // these properties are exposed for backwards compatibility:
    window.jstag.extend = extend;
    window.jstag.ckieGet = getCookie;
    window.jstag.ckieSet = setCookie;
    window.jstag.ckieDel = deleteCookie;
    window.jstag.isLoaded = false;

    window.jstag.util = {
      forEach: forEach,
      reduce: reduce,
      map: map,
      filter: filter,
      contains: contains,
      pairs: pairs,
      object: object,
      filterObject: filterObject,
      trim: trim,
      extend: extend,
      expose: expose,
      once: once,
      parseUri: parseUri,
      parseQueryString: parseQueryString
    };

    function reset() {
      if (instance) {
        instance.clearCookies();
      }
    // Do not fire any timers from a previously initialized instance.
      clearTimers();
    }

    return function init(config) {
      reset();
      instance = new JSTag(config);
      instance.pageAnalysis();

    // these properties are exposed for backwards compatibility:
      window.jstag.isLoaded = true;
      window.jstag.config = instance.config;

      return reset;
    };
  }());

// See: http://stackoverflow.com/questions/24987896/how-does-bluebirds-util-tofastproperties-function-make-an-objects-properties
  function toFastProperties(obj) {
  // This is here to hopefully prevent v8's optimizing compiler from removing this code:
    try {
      F.prototype = obj;
      return new F();
    } catch (e) {}

    function F() {}
  }
  toFastProperties(transports);
  toFastProperties(JSTag);
  toFastProperties(JSTag.prototype);
  toFastProperties(window.jstag);
  toFastProperties(window.jstag.util);
}(window));
