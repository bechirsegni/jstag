;(function(){

/**
 * Require the given path.
 *
 * @param {String} path
 * @return {Object} exports
 * @api public
 */

function require(path, parent, orig) {
  var resolved = require.resolve(path);

  // lookup failed
  if (null == resolved) {
    orig = orig || path;
    parent = parent || 'root';
    var err = new Error('Failed to require "' + orig + '" from "' + parent + '"');
    err.path = orig;
    err.parent = parent;
    err.require = true;
    throw err;
  }

  var module = require.modules[resolved];

  // perform real require()
  // by invoking the module's
  // registered function
  if (!module._resolving && !module.exports) {
    var mod = {};
    mod.exports = {};
    mod.client = mod.component = true;
    module._resolving = true;
    module.call(this, mod.exports, require.relative(resolved), mod);
    delete module._resolving;
    module.exports = mod.exports;
  }

  return module.exports;
}

/**
 * Registered modules.
 */

require.modules = {};

/**
 * Registered aliases.
 */

require.aliases = {};

/**
 * Resolve `path`.
 *
 * Lookup:
 *
 *   - PATH/index.js
 *   - PATH.js
 *   - PATH
 *
 * @param {String} path
 * @return {String} path or null
 * @api private
 */

require.resolve = function(path) {
  if (path.charAt(0) === '/') path = path.slice(1);

  var paths = [
    path,
    path + '.js',
    path + '.json',
    path + '/index.js',
    path + '/index.json'
  ];

  for (var i = 0; i < paths.length; i++) {
    var path = paths[i];
    if (require.modules.hasOwnProperty(path)) return path;
    if (require.aliases.hasOwnProperty(path)) return require.aliases[path];
  }
};

/**
 * Normalize `path` relative to the current path.
 *
 * @param {String} curr
 * @param {String} path
 * @return {String}
 * @api private
 */

require.normalize = function(curr, path) {
  var segs = [];

  if ('.' != path.charAt(0)) return path;

  curr = curr.split('/');
  path = path.split('/');

  for (var i = 0; i < path.length; ++i) {
    if ('..' == path[i]) {
      curr.pop();
    } else if ('.' != path[i] && '' != path[i]) {
      segs.push(path[i]);
    }
  }

  return curr.concat(segs).join('/');
};

/**
 * Register module at `path` with callback `definition`.
 *
 * @param {String} path
 * @param {Function} definition
 * @api private
 */

require.register = function(path, definition) {
  require.modules[path] = definition;
};

/**
 * Alias a module definition.
 *
 * @param {String} from
 * @param {String} to
 * @api private
 */

require.alias = function(from, to) {
  if (!require.modules.hasOwnProperty(from)) {
    throw new Error('Failed to alias "' + from + '", it does not exist');
  }
  require.aliases[to] = from;
};

/**
 * Return a require function relative to the `parent` path.
 *
 * @param {String} parent
 * @return {Function}
 * @api private
 */

require.relative = function(parent) {
  var p = require.normalize(parent, '..');

  /**
   * lastIndexOf helper.
   */

  function lastIndexOf(arr, obj) {
    var i = arr.length;
    while (i--) {
      if (arr[i] === obj) return i;
    }
    return -1;
  }

  /**
   * The relative require() itself.
   */

  function localRequire(path) {
    var resolved = localRequire.resolve(path);
    return require(resolved, parent, path);
  }

  /**
   * Resolve relative to the parent.
   */

  localRequire.resolve = function(path) {
    var c = path.charAt(0);
    if ('/' == c) return path.slice(1);
    if ('.' == c) return require.normalize(p, path);

    // resolve deps by returning
    // the dep in the nearest "deps"
    // directory
    var segs = parent.split('/');
    var i = lastIndexOf(segs, 'deps') + 1;
    if (!i) i = 0;
    path = segs.slice(0, i + 1).join('/') + '/deps/' + path;
    return path;
  };

  /**
   * Check if module is defined at `path`.
   */

  localRequire.exists = function(path) {
    return require.modules.hasOwnProperty(localRequire.resolve(path));
  };

  return localRequire;
};
require.register("avetisk-defaults/index.js", function(exports, require, module){
'use strict';

/**
 * Merge default values.
 *
 * @param {Object} dest
 * @param {Object} defaults
 * @return {Object}
 * @api public
 */
var defaults = function (dest, src, recursive) {
  for (var prop in src) {
    if (recursive && dest[prop] instanceof Object && src[prop] instanceof Object) {
      dest[prop] = defaults(dest[prop], src[prop], true);
    } else if (! (prop in dest)) {
      dest[prop] = src[prop];
    }
  }

  return dest;
};

/**
 * Expose `defaults`.
 */
module.exports = defaults;

});
require.register("component-clone/index.js", function(exports, require, module){

/**
 * Module dependencies.
 */

var type;

try {
  type = require('type');
} catch(e){
  type = require('type-component');
}

/**
 * Module exports.
 */

module.exports = clone;

/**
 * Clones objects.
 *
 * @param {Mixed} any object
 * @api public
 */

function clone(obj){
  switch (type(obj)) {
    case 'object':
      var copy = {};
      for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
          copy[key] = clone(obj[key]);
        }
      }
      return copy;

    case 'array':
      var copy = new Array(obj.length);
      for (var i = 0, l = obj.length; i < l; i++) {
        copy[i] = clone(obj[i]);
      }
      return copy;

    case 'regexp':
      // from millermedeiros/amd-utils - MIT
      var flags = '';
      flags += obj.multiline ? 'm' : '';
      flags += obj.global ? 'g' : '';
      flags += obj.ignoreCase ? 'i' : '';
      return new RegExp(obj.source, flags);

    case 'date':
      return new Date(obj.getTime());

    default: // string, number, boolean, …
      return obj;
  }
}

});
require.register("component-cookie/index.js", function(exports, require, module){
/**
 * Encode.
 */

var encode = encodeURIComponent;

/**
 * Decode.
 */

var decode = decodeURIComponent;

/**
 * Set or get cookie `name` with `value` and `options` object.
 *
 * @param {String} name
 * @param {String} value
 * @param {Object} options
 * @return {Mixed}
 * @api public
 */

module.exports = function(name, value, options){
  switch (arguments.length) {
    case 3:
    case 2:
      return set(name, value, options);
    case 1:
      return get(name);
    default:
      return all();
  }
};

/**
 * Set cookie `name` to `value`.
 *
 * @param {String} name
 * @param {String} value
 * @param {Object} options
 * @api private
 */

function set(name, value, options) {
  options = options || {};
  var str = encode(name) + '=' + encode(value);

  if (null == value) options.maxage = -1;

  if (options.maxage) {
    options.expires = new Date(+new Date + options.maxage);
  }

  if (options.path) str += '; path=' + options.path;
  if (options.domain) str += '; domain=' + options.domain;
  if (options.expires) str += '; expires=' + options.expires.toUTCString();
  if (options.secure) str += '; secure';

  document.cookie = str;
}

/**
 * Return all cookies.
 *
 * @return {Object}
 * @api private
 */

function all() {
  return parse(document.cookie);
}

/**
 * Get cookie `name`.
 *
 * @param {String} name
 * @return {String}
 * @api private
 */

function get(name) {
  return all()[name];
}

/**
 * Parse cookie `str`.
 *
 * @param {String} str
 * @return {Object}
 * @api private
 */

function parse(str) {
  var obj = {};
  var pairs = str.split(/ *; */);
  var pair;
  if ('' == pairs[0]) return obj;
  for (var i = 0; i < pairs.length; ++i) {
    pair = pairs[i].split('=');
    obj[decode(pair[0])] = decode(pair[1]);
  }
  return obj;
}

});
require.register("component-each/index.js", function(exports, require, module){

/**
 * Module dependencies.
 */

var type = require('type');

/**
 * HOP reference.
 */

var has = Object.prototype.hasOwnProperty;

/**
 * Iterate the given `obj` and invoke `fn(val, i)`.
 *
 * @param {String|Array|Object} obj
 * @param {Function} fn
 * @api public
 */

module.exports = function(obj, fn){
  switch (type(obj)) {
    case 'array':
      return array(obj, fn);
    case 'object':
      if ('number' == typeof obj.length) return array(obj, fn);
      return object(obj, fn);
    case 'string':
      return string(obj, fn);
  }
};

/**
 * Iterate string chars.
 *
 * @param {String} obj
 * @param {Function} fn
 * @api private
 */

function string(obj, fn) {
  for (var i = 0; i < obj.length; ++i) {
    fn(obj.charAt(i), i);
  }
}

/**
 * Iterate object keys.
 *
 * @param {Object} obj
 * @param {Function} fn
 * @api private
 */

function object(obj, fn) {
  for (var key in obj) {
    if (has.call(obj, key)) {
      fn(key, obj[key]);
    }
  }
}

/**
 * Iterate array-ish.
 *
 * @param {Array|Object} obj
 * @param {Function} fn
 * @api private
 */

function array(obj, fn) {
  for (var i = 0; i < obj.length; ++i) {
    fn(obj[i], i);
  }
}
});
require.register("component-event/index.js", function(exports, require, module){

/**
 * Bind `el` event `type` to `fn`.
 *
 * @param {Element} el
 * @param {String} type
 * @param {Function} fn
 * @param {Boolean} capture
 * @return {Function}
 * @api public
 */

exports.bind = function(el, type, fn, capture){
  if (el.addEventListener) {
    el.addEventListener(type, fn, capture || false);
  } else {
    el.attachEvent('on' + type, fn);
  }
  return fn;
};

/**
 * Unbind `el` event `type`'s callback `fn`.
 *
 * @param {Element} el
 * @param {String} type
 * @param {Function} fn
 * @param {Boolean} capture
 * @return {Function}
 * @api public
 */

exports.unbind = function(el, type, fn, capture){
  if (el.removeEventListener) {
    el.removeEventListener(type, fn, capture || false);
  } else {
    el.detachEvent('on' + type, fn);
  }
  return fn;
};

});
require.register("component-inherit/index.js", function(exports, require, module){

module.exports = function(a, b){
  var fn = function(){};
  fn.prototype = b.prototype;
  a.prototype = new fn;
  a.prototype.constructor = a;
};
});
require.register("component-object/index.js", function(exports, require, module){

/**
 * HOP ref.
 */

var has = Object.prototype.hasOwnProperty;

/**
 * Return own keys in `obj`.
 *
 * @param {Object} obj
 * @return {Array}
 * @api public
 */

exports.keys = Object.keys || function(obj){
  var keys = [];
  for (var key in obj) {
    if (has.call(obj, key)) {
      keys.push(key);
    }
  }
  return keys;
};

/**
 * Return own values in `obj`.
 *
 * @param {Object} obj
 * @return {Array}
 * @api public
 */

exports.values = function(obj){
  var vals = [];
  for (var key in obj) {
    if (has.call(obj, key)) {
      vals.push(obj[key]);
    }
  }
  return vals;
};

/**
 * Merge `b` into `a`.
 *
 * @param {Object} a
 * @param {Object} b
 * @return {Object} a
 * @api public
 */

exports.merge = function(a, b){
  for (var key in b) {
    if (has.call(b, key)) {
      a[key] = b[key];
    }
  }
  return a;
};

/**
 * Return length of `obj`.
 *
 * @param {Object} obj
 * @return {Number}
 * @api public
 */

exports.length = function(obj){
  return exports.keys(obj).length;
};

/**
 * Check if `obj` is empty.
 *
 * @param {Object} obj
 * @return {Boolean}
 * @api public
 */

exports.isEmpty = function(obj){
  return 0 == exports.length(obj);
};
});
require.register("component-trim/index.js", function(exports, require, module){

exports = module.exports = trim;

function trim(str){
  return str.replace(/^\s*|\s*$/g, '');
}

exports.left = function(str){
  return str.replace(/^\s*/, '');
};

exports.right = function(str){
  return str.replace(/\s*$/, '');
};

});
require.register("component-querystring/index.js", function(exports, require, module){

/**
 * Module dependencies.
 */

var trim = require('trim');

/**
 * Parse the given query `str`.
 *
 * @param {String} str
 * @return {Object}
 * @api public
 */

exports.parse = function(str){
  if ('string' != typeof str) return {};

  str = trim(str);
  if ('' == str) return {};

  var obj = {};
  var pairs = str.split('&');
  for (var i = 0; i < pairs.length; i++) {
    var parts = pairs[i].split('=');
    obj[parts[0]] = null == parts[1]
      ? ''
      : decodeURIComponent(parts[1]);
  }

  return obj;
};

/**
 * Stringify the given `obj`.
 *
 * @param {Object} obj
 * @return {String}
 * @api public
 */

exports.stringify = function(obj){
  if (!obj) return '';
  var pairs = [];
  for (var key in obj) {
    pairs.push(encodeURIComponent(key) + '=' + encodeURIComponent(obj[key]));
  }
  return pairs.join('&');
};

});
require.register("component-type/index.js", function(exports, require, module){

/**
 * toString ref.
 */

var toString = Object.prototype.toString;

/**
 * Return the type of `val`.
 *
 * @param {Mixed} val
 * @return {String}
 * @api public
 */

module.exports = function(val){
  switch (toString.call(val)) {
    case '[object Function]': return 'function';
    case '[object Date]': return 'date';
    case '[object RegExp]': return 'regexp';
    case '[object Arguments]': return 'arguments';
    case '[object Array]': return 'array';
    case '[object String]': return 'string';
  }

  if (val === null) return 'null';
  if (val === undefined) return 'undefined';
  if (val && val.nodeType === 1) return 'element';
  if (val === Object(val)) return 'object';

  return typeof val;
};

});
require.register("component-url/index.js", function(exports, require, module){

/**
 * Parse the given `url`.
 *
 * @param {String} str
 * @return {Object}
 * @api public
 */

exports.parse = function(url){
  var a = document.createElement('a');
  a.href = url;
  return {
    href: a.href,
    host: a.host || location.host,
    port: a.port || location.port,
    hash: a.hash,
    hostname: a.hostname || location.hostname,
    pathname: a.pathname.charAt(0) != '/' ? '/' + a.pathname : a.pathname,
    protocol: !a.protocol || ':' == a.protocol ? location.protocol : a.protocol,
    search: a.search,
    query: a.search.slice(1)
  };
};

/**
 * Check if `url` is absolute.
 *
 * @param {String} url
 * @return {Boolean}
 * @api public
 */

exports.isAbsolute = function(url){
  return 0 == url.indexOf('//') || !!~url.indexOf('://');
};

/**
 * Check if `url` is relative.
 *
 * @param {String} url
 * @return {Boolean}
 * @api public
 */

exports.isRelative = function(url){
  return !exports.isAbsolute(url);
};

/**
 * Check if `url` is cross domain.
 *
 * @param {String} url
 * @return {Boolean}
 * @api public
 */

exports.isCrossDomain = function(url){
  url = exports.parse(url);
  return url.hostname !== location.hostname
    || url.port !== location.port
    || url.protocol !== location.protocol;
};
});
require.register("segmentio-after/index.js", function(exports, require, module){

module.exports = function after (times, func) {
  // After 0, really?
  if (times <= 0) return func();

  // That's more like it.
  return function() {
    if (--times < 1) {
      return func.apply(this, arguments);
    }
  };
};
});
require.register("segmentio-alias/index.js", function(exports, require, module){

module.exports = function alias (object, aliases) {
    // For each of our aliases, rename our object's keys.
    for (var oldKey in aliases) {
        var newKey = aliases[oldKey];
        if (object[oldKey] !== undefined) {
            object[newKey] = object[oldKey];
            delete object[oldKey];
        }
    }
};
});
require.register("component-bind/index.js", function(exports, require, module){

/**
 * Slice reference.
 */

var slice = [].slice;

/**
 * Bind `obj` to `fn`.
 *
 * @param {Object} obj
 * @param {Function|String} fn or string
 * @return {Function}
 * @api public
 */

module.exports = function(obj, fn){
  if ('string' == typeof fn) fn = obj[fn];
  if ('function' != typeof fn) throw new Error('bind() requires a function');
  var args = [].slice.call(arguments, 2);
  return function(){
    return fn.apply(obj, args.concat(slice.call(arguments)));
  }
};

});
require.register("segmentio-bind-all/index.js", function(exports, require, module){

var bind   = require('bind')
  , type   = require('type');


module.exports = function (obj) {
  for (var key in obj) {
    var val = obj[key];
    if (type(val) === 'function') obj[key] = bind(obj, obj[key]);
  }
  return obj;
};
});
require.register("segmentio-canonical/index.js", function(exports, require, module){
module.exports = function canonical () {
  var tags = document.getElementsByTagName('link');
  for (var i = 0, tag; tag = tags[i]; i++) {
    if ('canonical' == tag.getAttribute('rel')) return tag.getAttribute('href');
  }
};
});
require.register("segmentio-extend/index.js", function(exports, require, module){

module.exports = function extend (object) {
    // Takes an unlimited number of extenders.
    var args = Array.prototype.slice.call(arguments, 1);

    // For each extender, copy their properties on our object.
    for (var i = 0, source; source = args[i]; i++) {
        if (!source) continue;
        for (var property in source) {
            object[property] = source[property];
        }
    }

    return object;
};
});
require.register("segmentio-is-email/index.js", function(exports, require, module){

module.exports = function isEmail (string) {
    return (/.+\@.+\..+/).test(string);
};
});
require.register("segmentio-is-meta/index.js", function(exports, require, module){
module.exports = function isMeta (e) {
    if (e.metaKey || e.altKey || e.ctrlKey || e.shiftKey) return true;

    // Logic that handles checks for the middle mouse button, based
    // on [jQuery](https://github.com/jquery/jquery/blob/master/src/event.js#L466).
    var which = e.which, button = e.button;
    if (!which && button !== undefined) {
      return (!button & 1) && (!button & 2) && (button & 4);
    } else if (which === 2) {
      return true;
    }

    return false;
};
});
require.register("component-json-fallback/index.js", function(exports, require, module){
/*
    json2.js
    2011-10-19

    Public Domain.

    NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.

    See http://www.JSON.org/js.html


    This code should be minified before deployment.
    See http://javascript.crockford.com/jsmin.html

    USE YOUR OWN COPY. IT IS EXTREMELY UNWISE TO LOAD CODE FROM SERVERS YOU DO
    NOT CONTROL.


    This file creates a global JSON object containing two methods: stringify
    and parse.

        JSON.stringify(value, replacer, space)
            value       any JavaScript value, usually an object or array.

            replacer    an optional parameter that determines how object
                        values are stringified for objects. It can be a
                        function or an array of strings.

            space       an optional parameter that specifies the indentation
                        of nested structures. If it is omitted, the text will
                        be packed without extra whitespace. If it is a number,
                        it will specify the number of spaces to indent at each
                        level. If it is a string (such as '\t' or '&nbsp;'),
                        it contains the characters used to indent at each level.

            This method produces a JSON text from a JavaScript value.

            When an object value is found, if the object contains a toJSON
            method, its toJSON method will be called and the result will be
            stringified. A toJSON method does not serialize: it returns the
            value represented by the name/value pair that should be serialized,
            or undefined if nothing should be serialized. The toJSON method
            will be passed the key associated with the value, and this will be
            bound to the value

            For example, this would serialize Dates as ISO strings.

                Date.prototype.toJSON = function (key) {
                    function f(n) {
                        // Format integers to have at least two digits.
                        return n < 10 ? '0' + n : n;
                    }

                    return this.getUTCFullYear()   + '-' +
                         f(this.getUTCMonth() + 1) + '-' +
                         f(this.getUTCDate())      + 'T' +
                         f(this.getUTCHours())     + ':' +
                         f(this.getUTCMinutes())   + ':' +
                         f(this.getUTCSeconds())   + 'Z';
                };

            You can provide an optional replacer method. It will be passed the
            key and value of each member, with this bound to the containing
            object. The value that is returned from your method will be
            serialized. If your method returns undefined, then the member will
            be excluded from the serialization.

            If the replacer parameter is an array of strings, then it will be
            used to select the members to be serialized. It filters the results
            such that only members with keys listed in the replacer array are
            stringified.

            Values that do not have JSON representations, such as undefined or
            functions, will not be serialized. Such values in objects will be
            dropped; in arrays they will be replaced with null. You can use
            a replacer function to replace those with JSON values.
            JSON.stringify(undefined) returns undefined.

            The optional space parameter produces a stringification of the
            value that is filled with line breaks and indentation to make it
            easier to read.

            If the space parameter is a non-empty string, then that string will
            be used for indentation. If the space parameter is a number, then
            the indentation will be that many spaces.

            Example:

            text = JSON.stringify(['e', {pluribus: 'unum'}]);
            // text is '["e",{"pluribus":"unum"}]'


            text = JSON.stringify(['e', {pluribus: 'unum'}], null, '\t');
            // text is '[\n\t"e",\n\t{\n\t\t"pluribus": "unum"\n\t}\n]'

            text = JSON.stringify([new Date()], function (key, value) {
                return this[key] instanceof Date ?
                    'Date(' + this[key] + ')' : value;
            });
            // text is '["Date(---current time---)"]'


        JSON.parse(text, reviver)
            This method parses a JSON text to produce an object or array.
            It can throw a SyntaxError exception.

            The optional reviver parameter is a function that can filter and
            transform the results. It receives each of the keys and values,
            and its return value is used instead of the original value.
            If it returns what it received, then the structure is not modified.
            If it returns undefined then the member is deleted.

            Example:

            // Parse the text. Values that look like ISO date strings will
            // be converted to Date objects.

            myData = JSON.parse(text, function (key, value) {
                var a;
                if (typeof value === 'string') {
                    a =
/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/.exec(value);
                    if (a) {
                        return new Date(Date.UTC(+a[1], +a[2] - 1, +a[3], +a[4],
                            +a[5], +a[6]));
                    }
                }
                return value;
            });

            myData = JSON.parse('["Date(09/09/2001)"]', function (key, value) {
                var d;
                if (typeof value === 'string' &&
                        value.slice(0, 5) === 'Date(' &&
                        value.slice(-1) === ')') {
                    d = new Date(value.slice(5, -1));
                    if (d) {
                        return d;
                    }
                }
                return value;
            });


    This is a reference implementation. You are free to copy, modify, or
    redistribute.
*/

/*jslint evil: true, regexp: true */

/*members "", "\b", "\t", "\n", "\f", "\r", "\"", JSON, "\\", apply,
    call, charCodeAt, getUTCDate, getUTCFullYear, getUTCHours,
    getUTCMinutes, getUTCMonth, getUTCSeconds, hasOwnProperty, join,
    lastIndex, length, parse, prototype, push, replace, slice, stringify,
    test, toJSON, toString, valueOf
*/


// Create a JSON object only if one does not already exist. We create the
// methods in a closure to avoid creating global variables.

var JSON = {};

(function () {
    'use strict';

    function f(n) {
        // Format integers to have at least two digits.
        return n < 10 ? '0' + n : n;
    }

    if (typeof Date.prototype.toJSON !== 'function') {

        Date.prototype.toJSON = function (key) {

            return isFinite(this.valueOf())
                ? this.getUTCFullYear()     + '-' +
                    f(this.getUTCMonth() + 1) + '-' +
                    f(this.getUTCDate())      + 'T' +
                    f(this.getUTCHours())     + ':' +
                    f(this.getUTCMinutes())   + ':' +
                    f(this.getUTCSeconds())   + 'Z'
                : null;
        };

        String.prototype.toJSON      =
            Number.prototype.toJSON  =
            Boolean.prototype.toJSON = function (key) {
                return this.valueOf();
            };
    }

    var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        gap,
        indent,
        meta = {    // table of character substitutions
            '\b': '\\b',
            '\t': '\\t',
            '\n': '\\n',
            '\f': '\\f',
            '\r': '\\r',
            '"' : '\\"',
            '\\': '\\\\'
        },
        rep;


    function quote(string) {

// If the string contains no control characters, no quote characters, and no
// backslash characters, then we can safely slap some quotes around it.
// Otherwise we must also replace the offending characters with safe escape
// sequences.

        escapable.lastIndex = 0;
        return escapable.test(string) ? '"' + string.replace(escapable, function (a) {
            var c = meta[a];
            return typeof c === 'string'
                ? c
                : '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
        }) + '"' : '"' + string + '"';
    }


    function str(key, holder) {

// Produce a string from holder[key].

        var i,          // The loop counter.
            k,          // The member key.
            v,          // The member value.
            length,
            mind = gap,
            partial,
            value = holder[key];

// If the value has a toJSON method, call it to obtain a replacement value.

        if (value && typeof value === 'object' &&
                typeof value.toJSON === 'function') {
            value = value.toJSON(key);
        }

// If we were called with a replacer function, then call the replacer to
// obtain a replacement value.

        if (typeof rep === 'function') {
            value = rep.call(holder, key, value);
        }

// What happens next depends on the value's type.

        switch (typeof value) {
        case 'string':
            return quote(value);

        case 'number':

// JSON numbers must be finite. Encode non-finite numbers as null.

            return isFinite(value) ? String(value) : 'null';

        case 'boolean':
        case 'null':

// If the value is a boolean or null, convert it to a string. Note:
// typeof null does not produce 'null'. The case is included here in
// the remote chance that this gets fixed someday.

            return String(value);

// If the type is 'object', we might be dealing with an object or an array or
// null.

        case 'object':

// Due to a specification blunder in ECMAScript, typeof null is 'object',
// so watch out for that case.

            if (!value) {
                return 'null';
            }

// Make an array to hold the partial results of stringifying this object value.

            gap += indent;
            partial = [];

// Is the value an array?

            if (Object.prototype.toString.apply(value) === '[object Array]') {

// The value is an array. Stringify every element. Use null as a placeholder
// for non-JSON values.

                length = value.length;
                for (i = 0; i < length; i += 1) {
                    partial[i] = str(i, value) || 'null';
                }

// Join all of the elements together, separated with commas, and wrap them in
// brackets.

                v = partial.length === 0
                    ? '[]'
                    : gap
                    ? '[\n' + gap + partial.join(',\n' + gap) + '\n' + mind + ']'
                    : '[' + partial.join(',') + ']';
                gap = mind;
                return v;
            }

// If the replacer is an array, use it to select the members to be stringified.

            if (rep && typeof rep === 'object') {
                length = rep.length;
                for (i = 0; i < length; i += 1) {
                    if (typeof rep[i] === 'string') {
                        k = rep[i];
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            } else {

// Otherwise, iterate through all of the keys in the object.

                for (k in value) {
                    if (Object.prototype.hasOwnProperty.call(value, k)) {
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            }

// Join all of the member texts together, separated with commas,
// and wrap them in braces.

            v = partial.length === 0
                ? '{}'
                : gap
                ? '{\n' + gap + partial.join(',\n' + gap) + '\n' + mind + '}'
                : '{' + partial.join(',') + '}';
            gap = mind;
            return v;
        }
    }

// If the JSON object does not yet have a stringify method, give it one.

    if (typeof JSON.stringify !== 'function') {
        JSON.stringify = function (value, replacer, space) {

// The stringify method takes a value and an optional replacer, and an optional
// space parameter, and returns a JSON text. The replacer can be a function
// that can replace values, or an array of strings that will select the keys.
// A default replacer method can be provided. Use of the space parameter can
// produce text that is more easily readable.

            var i;
            gap = '';
            indent = '';

// If the space parameter is a number, make an indent string containing that
// many spaces.

            if (typeof space === 'number') {
                for (i = 0; i < space; i += 1) {
                    indent += ' ';
                }

// If the space parameter is a string, it will be used as the indent string.

            } else if (typeof space === 'string') {
                indent = space;
            }

// If there is a replacer, it must be a function or an array.
// Otherwise, throw an error.

            rep = replacer;
            if (replacer && typeof replacer !== 'function' &&
                    (typeof replacer !== 'object' ||
                    typeof replacer.length !== 'number')) {
                throw new Error('JSON.stringify');
            }

// Make a fake root object containing our value under the key of ''.
// Return the result of stringifying the value.

            return str('', {'': value});
        };
    }


// If the JSON object does not yet have a parse method, give it one.

    if (typeof JSON.parse !== 'function') {
        JSON.parse = function (text, reviver) {

// The parse method takes a text and an optional reviver function, and returns
// a JavaScript value if the text is a valid JSON text.

            var j;

            function walk(holder, key) {

// The walk method is used to recursively walk the resulting structure so
// that modifications can be made.

                var k, v, value = holder[key];
                if (value && typeof value === 'object') {
                    for (k in value) {
                        if (Object.prototype.hasOwnProperty.call(value, k)) {
                            v = walk(value, k);
                            if (v !== undefined) {
                                value[k] = v;
                            } else {
                                delete value[k];
                            }
                        }
                    }
                }
                return reviver.call(holder, key, value);
            }


// Parsing happens in four stages. In the first stage, we replace certain
// Unicode characters with escape sequences. JavaScript handles many characters
// incorrectly, either silently deleting them, or treating them as line endings.

            text = String(text);
            cx.lastIndex = 0;
            if (cx.test(text)) {
                text = text.replace(cx, function (a) {
                    return '\\u' +
                        ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
                });
            }

// In the second stage, we run the text against regular expressions that look
// for non-JSON patterns. We are especially concerned with '()' and 'new'
// because they can cause invocation, and '=' because it can cause mutation.
// But just to be safe, we want to reject all unexpected forms.

// We split the second stage into 4 regexp operations in order to work around
// crippling inefficiencies in IE's and Safari's regexp engines. First we
// replace the JSON backslash pairs with '@' (a non-JSON character). Second, we
// replace all simple value tokens with ']' characters. Third, we delete all
// open brackets that follow a colon or comma or that begin the text. Finally,
// we look to see that the remaining characters are only whitespace or ']' or
// ',' or ':' or '{' or '}'. If that is so, then the text is safe for eval.

            if (/^[\],:{}\s]*$/
                    .test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@')
                        .replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']')
                        .replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {

// In the third stage we use the eval function to compile the text into a
// JavaScript structure. The '{' operator is subject to a syntactic ambiguity
// in JavaScript: it can begin a block or an object literal. We wrap the text
// in parens to eliminate the ambiguity.

                j = eval('(' + text + ')');

// In the optional fourth stage, we recursively walk the new structure, passing
// each name/value pair to a reviver function for possible transformation.

                return typeof reviver === 'function'
                    ? walk({'': j}, '')
                    : j;
            }

// If the text is not JSON parseable, then a SyntaxError is thrown.

            throw new SyntaxError('JSON.parse');
        };
    }
}());

module.exports = JSON
});
require.register("segmentio-json/index.js", function(exports, require, module){

module.exports = 'undefined' == typeof JSON
  ? require('json-fallback')
  : JSON;

});
require.register("segmentio-load-date/index.js", function(exports, require, module){


/*
 * Load date.
 *
 * For reference: http://www.html5rocks.com/en/tutorials/webperformance/basics/
 */

var time = new Date()
  , perf = window.performance;

if (perf && perf.timing && perf.timing.responseEnd) {
  time = new Date(perf.timing.responseEnd);
}

module.exports = time;
});
require.register("segmentio-load-script/index.js", function(exports, require, module){
var type = require('type');


module.exports = function loadScript (options, callback) {
    if (!options) throw new Error('Cant load nothing...');

    // Allow for the simplest case, just passing a `src` string.
    if (type(options) === 'string') options = { src : options };

    var https = document.location.protocol === 'https:';

    // If you use protocol relative URLs, third-party scripts like Google
    // Analytics break when testing with `file:` so this fixes that.
    if (options.src && options.src.indexOf('//') === 0) {
        options.src = https ? 'https:' + options.src : 'http:' + options.src;
    }

    // Allow them to pass in different URLs depending on the protocol.
    if (https && options.https) options.src = options.https;
    else if (!https && options.http) options.src = options.http;

    // Make the `<script>` element and insert it before the first script on the
    // page, which is guaranteed to exist since this Javascript is running.
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.async = true;
    script.src = options.src;

    var firstScript = document.getElementsByTagName('script')[0];
    firstScript.parentNode.insertBefore(script, firstScript);

    // If we have a callback, attach event handlers, even in IE. Based off of
    // the Third-Party Javascript script loading example:
    // https://github.com/thirdpartyjs/thirdpartyjs-code/blob/master/examples/templates/02/loading-files/index.html
    if (callback && type(callback) === 'function') {
        if (script.addEventListener) {
            script.addEventListener('load', callback, false);
        } else if (script.attachEvent) {
            script.attachEvent('onreadystatechange', function () {
                if (/complete|loaded/.test(script.readyState)) callback();
            });
        }
    }

    // Return the script element in case they want to do anything special, like
    // give it an ID or attributes.
    return script;
};
});
require.register("segmentio-new-date/index.js", function(exports, require, module){
var type = require('type');


module.exports = function newDate (date) {
  // Milliseconds would be greater than 31557600000 (December 31, 1970).
  if ('number' === type(date) && date < 31557600000) date = date * 1000;

  // By default, delegate to Date, which will return `Invalid Date`s if wrong.
  return new Date(date);
};
});
require.register("segmentio-on-body/index.js", function(exports, require, module){
var each = require('each');


/**
 * Cache whether `<body>` exists.
 */

var body = false;


/**
 * Callbacks to call when the body exists.
 */

var callbacks = [];


/**
 * Export a way to add handlers to be invoked once the body exists.
 *
 * @param {Function} callback  A function to call when the body exists.
 */

module.exports = function onBody (callback) {
  if (body) {
    call(callback);
  } else {
    callbacks.push(callback);
  }
};


/**
 * Set an interval to check for `document.body`.
 */

var interval = setInterval(function () {
  if (!document.body) return;
  body = true;
  each(callbacks, call);
  clearInterval(interval);
}, 5);


/**
 * Call a callback, passing it the body.
 *
 * @param {Function} callback  The callback to call.
 */

function call (callback) {
  callback(document.body);
}
});
require.register("segmentio-store.js/store.js", function(exports, require, module){
var json             = require('json')
  , store            = {}
  , win              = window
	,	doc              = win.document
	,	localStorageName = 'localStorage'
	,	namespace        = '__storejs__'
	,	storage;

store.disabled = false
store.set = function(key, value) {}
store.get = function(key) {}
store.remove = function(key) {}
store.clear = function() {}
store.transact = function(key, defaultVal, transactionFn) {
	var val = store.get(key)
	if (transactionFn == null) {
		transactionFn = defaultVal
		defaultVal = null
	}
	if (typeof val == 'undefined') { val = defaultVal || {} }
	transactionFn(val)
	store.set(key, val)
}
store.getAll = function() {}

store.serialize = function(value) {
	return json.stringify(value)
}
store.deserialize = function(value) {
	if (typeof value != 'string') { return undefined }
	try { return json.parse(value) }
	catch(e) { return value || undefined }
}

// Functions to encapsulate questionable FireFox 3.6.13 behavior
// when about.config::dom.storage.enabled === false
// See https://github.com/marcuswestin/store.js/issues#issue/13
function isLocalStorageNameSupported() {
	try { return (localStorageName in win && win[localStorageName]) }
	catch(err) { return false }
}

if (isLocalStorageNameSupported()) {
	storage = win[localStorageName]
	store.set = function(key, val) {
		if (val === undefined) { return store.remove(key) }
		storage.setItem(key, store.serialize(val))
		return val
	}
	store.get = function(key) { return store.deserialize(storage.getItem(key)) }
	store.remove = function(key) { storage.removeItem(key) }
	store.clear = function() { storage.clear() }
	store.getAll = function() {
		var ret = {}
		for (var i=0; i<storage.length; ++i) {
			var key = storage.key(i)
			ret[key] = store.get(key)
		}
		return ret
	}
} else if (doc.documentElement.addBehavior) {
	var storageOwner,
		storageContainer
	// Since #userData storage applies only to specific paths, we need to
	// somehow link our data to a specific path.  We choose /favicon.ico
	// as a pretty safe option, since all browsers already make a request to
	// this URL anyway and being a 404 will not hurt us here.  We wrap an
	// iframe pointing to the favicon in an ActiveXObject(htmlfile) object
	// (see: http://msdn.microsoft.com/en-us/library/aa752574(v=VS.85).aspx)
	// since the iframe access rules appear to allow direct access and
	// manipulation of the document element, even for a 404 page.  This
	// document can be used instead of the current document (which would
	// have been limited to the current path) to perform #userData storage.
	try {
		storageContainer = new ActiveXObject('htmlfile')
		storageContainer.open()
		storageContainer.write('<s' + 'cript>document.w=window</s' + 'cript><iframe src="/favicon.ico"></iframe>')
		storageContainer.close()
		storageOwner = storageContainer.w.frames[0].document
		storage = storageOwner.createElement('div')
	} catch(e) {
		// somehow ActiveXObject instantiation failed (perhaps some special
		// security settings or otherwse), fall back to per-path storage
		storage = doc.createElement('div')
		storageOwner = doc.body
	}
	function withIEStorage(storeFunction) {
		return function() {
			var args = Array.prototype.slice.call(arguments, 0)
			args.unshift(storage)
			// See http://msdn.microsoft.com/en-us/library/ms531081(v=VS.85).aspx
			// and http://msdn.microsoft.com/en-us/library/ms531424(v=VS.85).aspx
			storageOwner.appendChild(storage)
			storage.addBehavior('#default#userData')
			storage.load(localStorageName)
			var result = storeFunction.apply(store, args)
			storageOwner.removeChild(storage)
			return result
		}
	}

	// In IE7, keys may not contain special chars. See all of https://github.com/marcuswestin/store.js/issues/40
	var forbiddenCharsRegex = new RegExp("[!\"#$%&'()*+,/\\\\:;<=>?@[\\]^`{|}~]", "g")
	function ieKeyFix(key) {
		return key.replace(forbiddenCharsRegex, '___')
	}
	store.set = withIEStorage(function(storage, key, val) {
		key = ieKeyFix(key)
		if (val === undefined) { return store.remove(key) }
		storage.setAttribute(key, store.serialize(val))
		storage.save(localStorageName)
		return val
	})
	store.get = withIEStorage(function(storage, key) {
		key = ieKeyFix(key)
		return store.deserialize(storage.getAttribute(key))
	})
	store.remove = withIEStorage(function(storage, key) {
		key = ieKeyFix(key)
		storage.removeAttribute(key)
		storage.save(localStorageName)
	})
	store.clear = withIEStorage(function(storage) {
		var attributes = storage.XMLDocument.documentElement.attributes
		storage.load(localStorageName)
		for (var i=0, attr; attr=attributes[i]; i++) {
			storage.removeAttribute(attr.name)
		}
		storage.save(localStorageName)
	})
	store.getAll = withIEStorage(function(storage) {
		var attributes = storage.XMLDocument.documentElement.attributes
		var ret = {}
		for (var i=0, attr; attr=attributes[i]; ++i) {
			var key = ieKeyFix(attr.name)
			ret[attr.name] = store.deserialize(storage.getAttribute(key))
		}
		return ret
	})
}

try {
	store.set(namespace, namespace)
	if (store.get(namespace) != namespace) { store.disabled = true }
	store.remove(namespace)
} catch(e) {
	store.disabled = true
}
store.enabled = !store.disabled

module.exports = store;
});
require.register("segmentio-top-domain/index.js", function(exports, require, module){

var url = require('url');

// Official Grammar: http://tools.ietf.org/html/rfc883#page-56
// Look for tlds with up to 2-6 characters.

module.exports = function (urlStr) {

  var host     = url.parse(urlStr).hostname
    , topLevel = host.match(/[a-z0-9][a-z0-9\-]*[a-z0-9]\.[a-z\.]{2,6}$/i);

  return topLevel ? topLevel[0] : host;
};
});
require.register("timoxley-next-tick/index.js", function(exports, require, module){
"use strict"

if (typeof setImmediate == 'function') {
  module.exports = function(f){ setImmediate(f) }
}
// legacy node.js
else if (typeof process != 'undefined' && typeof process.nextTick == 'function') {
  module.exports = process.nextTick
}
// fallback for other environments / postMessage behaves badly on IE8
else if (typeof window == 'undefined' || window.ActiveXObject || !window.postMessage) {
  module.exports = function(f){ setTimeout(f) };
} else {
  var q = [];

  window.addEventListener('message', function(){
    var i = 0;
    while (i < q.length) {
      try { q[i++](); }
      catch (e) {
        q = q.slice(i);
        window.postMessage('tic!', '*');
        throw e;
      }
    }
    q.length = 0;
  }, true);

  module.exports = function(fn){
    if (!q.length) window.postMessage('tic!', '*');
    q.push(fn);
  }
}

});
require.register("yields-prevent/index.js", function(exports, require, module){

/**
 * prevent default on the given `e`.
 * 
 * examples:
 * 
 *      anchor.onclick = prevent;
 *      anchor.onclick = function(e){
 *        if (something) return prevent(e);
 *      };
 * 
 * @param {Event} e
 */

module.exports = function(e){
  e = e || window.event
  return e.preventDefault
    ? e.preventDefault()
    : e.returnValue = false;
};

});
require.register("analytics/src/indexShim.js", function(exports, require, module){
// Analytics.js Shim for starting analytics
// Analytics.js may be freely distributed under the MIT license.
// Replaces the src/index.js

var Analytics = require('./analytics')
  , providers = require('./providers');

var analytics = new Analytics(providers);

if (!analytics["page"]) {
	analytics["page"] = analytics.pageview
}

if (window.analyticsInit) {
  window.analyticsInit(analytics)
}

// Loop through the interim analytics queue and reapply the calls to their
// proper analytics.js method.
while (window.analytics.length > 0) {
  var item = window.analytics.shift();
  var method = item.shift();
  if (analytics[method]) analytics[method].apply(analytics, item);
}

module.exports = analytics;
});
require.register("analytics/src/analytics.js", function(exports, require, module){
var after          = require('after')
  , bind           = require('event').bind
  , clone          = require('clone')
  , cookie         = require('./cookie')
  , each           = require('each')
  , extend         = require('extend')
  , isEmail        = require('is-email')
  , isMeta         = require('is-meta')
  , localStore     = require('./localStore')
  , newDate        = require('new-date')
  , size           = require('object').length
  , preventDefault = require('prevent')
  , Provider       = require('./provider')
  , providers      = require('./providers')
  , querystring    = require('querystring')
  , type           = require('type')
  , url            = require('url')
  , user           = require('./user')
  , utils          = require('./utils');


module.exports = Analytics;


/**
 * Analytics.
 *
 * @param {Object} Providers - Provider classes that the user can initialize.
 */

function Analytics (Providers) {
  var self = this;

  this.VERSION = '0.11.11';

  each(Providers, function (Provider) {
    self.addProvider(Provider);
  });

  // Wrap `onload` with our own that will cache the loaded state of the page.
  var oldonload = window.onload;
  window.onload = function () {
    self.loaded = true;
    if ('function' === type(oldonload)) oldonload();
  };
}


/**
 * Extend the Analytics prototype.
 */

extend(Analytics.prototype, {

  // Whether `onload` has fired.
  loaded : false,

  // Whether `analytics` has been initialized.
  initialized : false,

  // Whether all of our analytics providers are ready to accept calls. Give it a
  // real jank name since we already use `analytics.ready` for the method.
  readied : false,

  // A queue for ready callbacks to run when our `readied` state becomes `true`.
  callbacks : [],

  // Milliseconds to wait for requests to clear before leaving the current page.
  timeout : 300,

  // A reference to the current user object.
  user : user,

  // The default Provider.
  Provider : Provider,

  // Providers that can be initialized. Add using `this.addProvider`.
  _providers : {},

  // The currently initialized providers.
  providers : [],


  /**
   * Add a provider to `_providers` to be initialized later.
   *
   * @param {String} name - The name of the provider.
   * @param {Function} Provider - The provider's class.
   */

  addProvider : function (Provider) {
    this._providers[Provider.prototype.name] = Provider;
  },


  /**
   * Initialize
   *
   * Call `initialize` to setup analytics.js before identifying or
   * tracking any users or events. For example:
   *
   *     analytics.initialize({
   *         'Google Analytics' : 'UA-XXXXXXX-X',
   *         'Segment.io'       : 'XXXXXXXXXXX',
   *         'KISSmetrics'      : 'XXXXXXXXXXX'
   *     });
   *
   * @param {Object} providers - a dictionary of the providers you want to
   * enable. The keys are the names of the providers and their values are either
   * an api key, or  dictionary of extra settings (including the api key).
   *
   * @param {Object} options (optional) - extra settings to initialize with.
   */

  initialize : function (providers, options) {
    options || (options = {});

    var self = this;

    // Reset our state.
    this.providers = [];
    this.initialized = false;
    this.readied = false;

    // Set the storage options
    cookie.options(options.cookie);
    localStore.options(options.localStorage);

    // Set the options for loading and saving the user
    user.options(options.user);
    user.load();

    // Create a ready method that will call all of our ready callbacks after all
    // of our providers have been initialized and loaded. We'll pass the
    // function into each provider's initialize method, so they can callback
    // after they've loaded successfully.
    var ready = after(size(providers), function () {
      self.readied = true;
      var callback;
      while(callback = self.callbacks.shift()) {
        callback();
      }
    });

    // Initialize a new instance of each provider with their `options`, and
    // copy the provider into `this.providers`.
    each(providers, function (key, options) {
      var Provider = self._providers[key];
      if (!Provider) return;
      self.providers.push(new Provider(options, ready, self));
    });

    // Identify and track any `ajs_uid` and `ajs_event` parameters in the URL.
    var query = url.parse(window.location.href).query;
    var queries = querystring.parse(query);
    if (queries.ajs_uid) this.identify(queries.ajs_uid);
    if (queries.ajs_event) this.track(queries.ajs_event);

    // Update the initialized state that other methods rely on.
    this.initialized = true;
  },


  /**
   * Ready
   *
   * Add a callback that will get called when all of the analytics services you
   * initialize are ready to be called. It's like jQuery's `ready` except for
   * analytics instead of the DOM.
   *
   * If we're already ready, it will callback immediately.
   *
   * @param {Function} callback - The callback to attach.
   */

  ready : function (callback) {
    if (type(callback) !== 'function') return;
    if (this.readied) return callback();
    this.callbacks.push(callback);
  },


  /**
   * Identify
   *
   * Identifying a user ties all of their actions to an ID you recognize
   * and records properties about a user. For example:
   *
   *     analytics.identify('4d3ed089fb60ab534684b7e0', {
   *         name  : 'Achilles',
   *         email : 'achilles@segment.io',
   *         age   : 23
   *     });
   *
   * @param {String} userId (optional) - The ID you recognize the user by.
   * Ideally this isn't an email, because that might change in the future.
   *
   * @param {Object} traits (optional) - A dictionary of traits you know about
   * the user. Things like `name`, `age`, etc.
   *
   * @param {Object} options (optional) - Settings for the identify call.
   *
   * @param {Function} callback (optional) - A function to call after a small
   * timeout, giving the identify call time to make requests.
   */

  identify : function (userId, traits, options, callback) {
    if (!this.initialized) return;

    // Allow for optional arguments.
    if (type(options) === 'function') {
      callback = options;
      options = undefined;
    }
    if (type(traits) === 'function') {
      callback = traits;
      traits = undefined;
    }
    if (type(userId) === 'object') {
      if (traits && type(traits) === 'function') callback = traits;
      traits = userId;
      userId = undefined;
    }

    // Use our cookied ID if they didn't provide one.
    if (userId === undefined || user === null) userId = user.id();

    // Update the cookie with the new userId and traits.
    var alias = user.update(userId, traits);

    // Clone `traits` before we manipulate it, so we don't do anything uncouth
    // and take the user.traits() so anonymous users carry over traits.
    traits = cleanTraits(userId, clone(user.traits()));

    // Call `identify` on all of our enabled providers that support it.
    each(this.providers, function (provider) {
      if (provider.identify && isEnabled(provider, options)) {
        var args = [userId, clone(traits), clone(options)];
        if (provider.ready) {
          provider.identify.apply(provider, args);
        } else {
          provider.enqueue('identify', args);
        }
      }
    });

    // If we should alias, go ahead and do it.
    // if (alias) this.alias(userId);

    if (callback && type(callback) === 'function') {
      setTimeout(callback, this.timeout);
    }
  },



  /**
   * Group
   *
   * Groups multiple users together under one "account" or "team" or "company".
   * Acts on the currently identified user, so you need to call identify before
   * calling group. For example:
   *
   *     analytics.identify('4d3ed089fb60ab534684b7e0', {
   *         name  : 'Achilles',
   *         email : 'achilles@segment.io',
   *         age   : 23
   *     });
   *
   *     analytics.group('5we93je3889fb60a937dk033', {
   *         name              : 'Acme Co.',
   *         numberOfEmployees : 42,
   *         location          : 'San Francisco'
   *     });
   *
   * @param {String} groupId - The ID you recognize the group by.
   *
   * @param {Object} properties (optional) - A dictionary of properties you know
   * about the group. Things like `numberOfEmployees`, `location`, etc.
   *
   * @param {Object} options (optional) - Settings for the group call.
   *
   * @param {Function} callback (optional) - A function to call after a small
   * timeout, giving the group call time to make requests.
   */

  group : function (groupId, properties, options, callback) {
    if (!this.initialized) return;

    // Allow for optional arguments.
    if (type(options) === 'function') {
      callback = options;
      options = undefined;
    }
    if (type(properties) === 'function') {
      callback = properties;
      properties = undefined;
    }

    // Clone `properties` before we manipulate it, so we don't do anything bad,
    // and back it by an empty object so that providers can assume it exists.
    properties = clone(properties) || {};

    // Convert dates from more types of input into Date objects.
    if (properties.created) properties.created = newDate(properties.created);

    // Call `group` on all of our enabled providers that support it.
    each(this.providers, function (provider) {
      if (provider.group && isEnabled(provider, options)) {
        var args = [groupId, clone(properties), clone(options)];
        if (provider.ready) {
          provider.group.apply(provider, args);
        } else {
          provider.enqueue('group', args);
        }
      }
    });

    // If we have a callback, call it after a small timeout.
    if (callback && type(callback) === 'function') {
      setTimeout(callback, this.timeout);
    }
  },


  /**
   * Track
   *
   * Record an event (or action) that your user has triggered. For example:
   *
   *     analytics.track('Added a Friend', {
   *         level  : 'hard',
   *         volume : 11
   *     });
   *
   * @param {String} event - The name of your event.
   *
   * @param {Object} properties (optional) - A dictionary of properties of the
   * event. `properties` are all camelCase (we'll automatically conver them to
   * the proper case each provider needs).
   *
   * @param {Object} options (optional) - Settings for the track call.
   *
   * @param {Function} callback - A function to call after a small
   * timeout, giving the identify time to make requests.
   */

  track : function (event, properties, options, callback) {
    if (!this.initialized) return;

    // Allow for optional arguments.
    if (type(options) === 'function') {
      callback = options;
      options = undefined;
    }
    if (type(properties) === 'function') {
      callback = properties;
      properties = undefined;
    }

    properties = clone(properties) || {};

    // Call `track` on all of our enabled providers that support it.
    each(this.providers, function (provider) {
      if (provider.track && isEnabled(provider, options)) {
        var args = [event, clone(properties), clone(options)];
        if (provider.ready) {
          provider.track.apply(provider, args);
        } else {
          provider.enqueue('track', args);
        }
      }
    });

    if (callback && type(callback) === 'function') {
      setTimeout(callback, this.timeout);
    }
  },


  /**
   * Track Link
   *
   * A helper for tracking outbound links that would normally navigate away from
   * the page before the track requests were made. It works by wrapping the
   * calls in a short timeout, giving the requests time to fire.
   *
   * @param {Element|Array} links - The link element or array of link elements
   * to bind to. (Allowing arrays makes it easy to pass in jQuery objects.)
   *
   * @param {String|Function} event - Passed directly to `track`. Or in the case
   * that it's a function, it will be called with the link element as the first
   * argument.
   *
   * @param {Object|Function} properties (optional) - Passed directly to
   * `track`. Or in the case that it's a function, it will be called with the
   * link element as the first argument.
   */

  trackLink : function (links, event, properties) {
    if (!links) return;

    // Turn a single link into an array so that we're always handling
    // arrays, which allows for passing jQuery objects.
    if ('element' === type(links)) links = [links];

    var self               = this
      , eventFunction      = 'function' === type(event)
      , propertiesFunction = 'function' === type(properties);

    each(links, function (el) {
      bind(el, 'click', function (e) {

        // Allow for `event` or `properties` to be a function. And pass it the
        // link element that was clicked.
        var newEvent      = eventFunction ? event(el) : event;
        var newProperties = propertiesFunction ? properties(el) : properties;

        self.track(newEvent, newProperties);

        // To justify us preventing the default behavior we must:
        //
        // * Have an `href` to use.
        // * Not have a `target="_blank"` attribute.
        // * Not have any special keys pressed, because they might be trying to
        //   open in a new tab, or window, or download.
        //
        // This might not cover all cases, but we'd rather throw out an event
        // than miss a case that breaks the user experience.
        if (el.href && el.target !== '_blank' && !isMeta(e)) {

          preventDefault(e);

          // Navigate to the url after just enough of a timeout.
          setTimeout(function () {
            window.location.href = el.href;
          }, self.timeout);
        }
      });
    });
  },


  /**
   * Track Form
   *
   * Similar to `trackClick`, this is a helper for tracking form submissions
   * that would normally navigate away from the page before a track request can
   * be sent. It works by preventing the default submit event, sending our
   * track requests, and then submitting the form programmatically.
   *
   * @param {Element|Array} forms - The form element or array of form elements
   * to bind to. (Allowing arrays makes it easy to pass in jQuery objects.)
   *
   * @param {String|Function} event - Passed directly to `track`. Or in the case
   * that it's a function, it will be called with the form element as the first
   * argument.
   *
   * @param {Object|Function} properties (optional) - Passed directly to
   * `track`. Or in the case that it's a function, it will be called with the
   * form element as the first argument.
   */

  trackForm : function (form, event, properties) {
    if (!form) return;

    // Turn a single element into an array so that we're always handling arrays,
    // which allows for passing jQuery objects.
    if ('element' === type(form)) form = [form];

    var self               = this
      , eventFunction      = 'function' === type(event)
      , propertiesFunction = 'function' === type(properties);

    each(form, function (el) {
      var handler = function (e) {

        // Allow for `event` or `properties` to be a function. And pass it the
        // form element that was submitted.
        var newEvent      = eventFunction ? event(el) : event;
        var newProperties = propertiesFunction ? properties(el) : properties;

        self.track(newEvent, newProperties);

        preventDefault(e);

        // Submit the form after a timeout, giving the event time to fire.
        setTimeout(function () {
          el.submit();
        }, self.timeout);
      };

      // Support the form being submitted via jQuery instead of for real. This
      // doesn't happen automatically because `el.submit()` doesn't actually
      // fire submit handlers, which is what jQuery uses internally. >_<
      var dom = window.jQuery || window.Zepto;
      if (dom) {
        dom(el).submit(handler);
      } else {
        bind(el, 'submit', handler);
      }
    });
  },


  /**
   * Pageview
   *
   * Simulate a pageview in single-page applications, where real pageviews don't
   * occur. This isn't support by all providers.
   *
   * @param {String} url (optional) - The path of the page (eg. '/login'). Most
   * providers will default to the current pages URL, so you don't need this.
   *
   * @param {Object} options (optional) - Settings for the pageview call.
   *
   */

  pageview : function (url,options) {
    if (!this.initialized) return;

    // Call `pageview` on all of our enabled providers that support it.
    each(this.providers, function (provider) {
      if (provider.pageview && isEnabled(provider, options)) {
        var args = [url];
        if (provider.ready) {
          provider.pageview.apply(provider, args);
        } else {
          provider.enqueue('pageview', args);
        }
      }
    });
  },


  /**
   * Alias
   *
   * Merges two previously unassociate user identities. This comes in handy if
   * the same user visits from two different devices and you want to combine
   * their analytics history.
   *
   * Some providers don't support merging users.
   *
   * @param {String} newId - The new ID you want to recognize the user by.
   *
   * @param {String} originalId (optional) - The original ID that the user was
   * recognized by. This defaults to the current identified user's ID if there
   * is one. In most cases you don't need to pass in the `originalId`.
   */

  alias : function (newId, originalId, options) {
    if (!this.initialized) return;

    if (type(originalId) === 'object') {
      options    = originalId;
      originalId = undefined;
    }

    // Call `alias` on all of our enabled providers that support it.
    each(this.providers, function (provider) {
      if (provider.alias && isEnabled(provider, options)) {
        var args = [newId, originalId];
        if (provider.ready) {
          provider.alias.apply(provider, args);
        } else {
          provider.enqueue('alias', args);
        }
      }
    });
  },


  /**
   * Log
   *
   * Log an error to analytics providers that support it, like Sentry.
   *
   * @param {Error|String} error - The error or string to log.
   * @param {Object} properties - Properties about the error.
   * @param {Object} options (optional) - Settings for the log call.
   */

  log : function (error, properties, options) {
    if (!this.initialized) return;

    each(this.providers, function (provider) {
      if (provider.log && isEnabled(provider, options)) {
        var args = [error, properties, options];
        if (provider.ready) {
          provider.log.apply(provider, args);
        } else {
          provider.enqueue('log', args);
        }
      }
    });
  }

});


/**
 * Backwards compatibility.
 */

// Alias `trackClick` and `trackSubmit`.
Analytics.prototype.trackClick = Analytics.prototype.trackLink;
Analytics.prototype.trackSubmit = Analytics.prototype.trackForm;


/**
 * Determine whether a provider is enabled or not based on the options object.
 *
 * @param {Object} provider - the current provider.
 * @param {Object} options - the current call's options.
 *
 * @return {Boolean} - wether the provider is enabled.
 */

var isEnabled = function (provider, options) {
  var enabled = true;
  if (!options || !options.providers) return enabled;

  // Default to the 'all' or 'All' setting.
  var map = options.providers;
  if (map.all !== undefined) enabled = map.all;
  if (map.All !== undefined) enabled = map.All;

  // Look for this provider's specific setting.
  var name = provider.name;
  if (map[name] !== undefined) enabled = map[name];

  return enabled;
};


/**
 * Clean up traits, default some useful things both so the user doesn't have to
 * and so we don't have to do it on a provider-basis.
 *
 * @param {Object}  traits  The traits object.
 * @return {Object}         The new traits object.
 */

var cleanTraits = function (userId, traits) {

  // Add the `email` trait if it doesn't exist and the `userId` is an email.
  if (!traits.email && isEmail(userId)) traits.email = userId;

  // Create the `name` trait if it doesn't exist and `firstName` and `lastName`
  // are both supplied.
  if (!traits.name && traits.firstName && traits.lastName) {
    traits.name = traits.firstName + ' ' + traits.lastName;
  }

  // Convert dates from more types of input into Date objects.
  if (traits.created) traits.created = newDate(traits.created);
  if (traits.company && traits.company.created) {
    traits.company.created = newDate(traits.company.created);
  }

  return traits;
};

});
require.register("analytics/src/cookie.js", function(exports, require, module){

var bindAll   = require('bind-all')
  , cookie    = require('cookie')
  , clone     = require('clone')
  , defaults  = require('defaults')
  , json      = require('json')
  , topDomain = require('top-domain');


function Cookie (options) {
  this.options(options);
}

/**
 * Get or set the cookie options
 *
 * @param  {Object} options
 *   @field {Number}  maxage (1 year)
 *   @field {String}  domain
 *   @field {String}  path
 *   @field {Boolean} secure
 */

Cookie.prototype.options = function (options) {
  if (arguments.length === 0) return this._options;

  options || (options = {});

  var domain = '.' + topDomain(window.location.href);

  // localhost cookies are special: http://curl.haxx.se/rfc/cookie_spec.html
  if (domain === '.localhost') domain = '';

  defaults(options, {
    maxage  : 31536000000, // default to a year
    path    : '/',
    domain  : domain
  });

  this._options = options;
};


/**
 * Set a value in our cookie
 *
 * @param  {String} key
 * @param  {Object} value
 * @return {Boolean} saved
 */

Cookie.prototype.set = function (key, value) {
  try {
    value = json.stringify(value);
    cookie(key, value, clone(this._options));
    return true;
  } catch (e) {
    return false;
  }
};


/**
 * Get a value from our cookie
 * @param  {String} key
 * @return {Object} value
 */

Cookie.prototype.get = function (key) {
  try {
    var value = cookie(key);
    value = value ? json.parse(value) : null;
    return value;
  } catch (e) {
    return null;
  }
};


/**
 * Remove a value from the cookie
 *
 * @param  {String}  key
 * @return {Boolean} removed
 */

Cookie.prototype.remove = function (key) {
  try {
    cookie(key, null, clone(this._options));
    return true;
  } catch (e) {
    return false;
  }
};


/**
 * Export singleton cookie
 */

module.exports = bindAll(new Cookie());


module.exports.Cookie = Cookie;

});
require.register("analytics/src/localStore.js", function(exports, require, module){

var bindAll  = require('bind-all')
  , defaults = require('defaults')
  , store    = require('store');


function Store (options) {
  this.options(options);
}


/**
 * Sets the options for the store
 *
 * @param  {Object} options
 *   @field {Boolean} enabled (true)
 */

Store.prototype.options = function (options) {
  if (arguments.length === 0) return this._options;

  options || (options = {});
  defaults(options, { enabled : true });

  this.enabled  = options.enabled && store.enabled;
  this._options = options;
};


/**
 * Sets a value in local storage
 *
 * @param  {String} key
 * @param  {Object} value
 */

Store.prototype.set = function (key, value) {
  if (!this.enabled) return false;
  return store.set(key, value);
};


/**
 * Gets a value from local storage
 *
 * @param  {String} key
 * @return {Object}
 */

Store.prototype.get = function (key) {
  if (!this.enabled) return null;
  return store.get(key);
};


/**
 * Removes a value from local storage
 *
 * @param  {String} key
 */

Store.prototype.remove = function (key) {
  if (!this.enabled) return false;
  return store.remove(key);
};


/**
 * Singleton exports
 */

module.exports = bindAll(new Store());
});
require.register("analytics/src/provider.js", function(exports, require, module){
var each   = require('each')
  , extend = require('extend')
  , type   = require('type');


module.exports = Provider;


/**
 * Provider
 *
 * @param {Object} options - settings to initialize the Provider with. This will
 * be merged with the Provider's own defaults.
 *
 * @param {Function} ready - a ready callback, to be called when the provider is
 * ready to handle analytics calls.
 */

function Provider (options, ready, analytics) {
  var self = this;

  // Store the reference to the global `analytics` object.
  this.analytics = analytics;

  // Make a queue of `{ method : 'identify', args : [] }` to unload once ready.
  this.queue = [];
  this.ready = false;

  // Allow for `options` to only be a string if the provider has specified
  // a default `key`, in which case convert `options` into a dictionary. Also
  // allow for it to be `true`, like in Optimizely's case where there is no need
  // for any default key.
  if (type(options) !== 'object') {
    if (options === true) {
      options = {};
    } else if (this.key) {
      var key = options;
      options = {};
      options[this.key] = key;
    } else {
      throw new Error('Couldnt resolve options.');
    }
  }

  // Extend the passed-in options with our defaults.
  this.options = extend({}, this.defaults, options);

  // Wrap our ready function, so that it ready from our internal queue first
  // and then marks us as ready.
  var dequeue = function () {
    each(self.queue, function (call) {
      var method = call.method
        , args   = call.args;
      self[method].apply(self, args);
    });
    self.ready = true;
    self.queue = [];
    ready();
  };

  // Call our initialize method.
  this.initialize.call(this, this.options, dequeue);
}


/**
 * Inheritance helper.
 *
 * Modeled after Backbone's `extend` method:
 * https://github.com/documentcloud/backbone/blob/master/backbone.js#L1464
 */

Provider.extend = function (properties) {
  var parent = this;
  var child = function () { return parent.apply(this, arguments); };
  var Surrogate = function () { this.constructor = child; };
  Surrogate.prototype = parent.prototype;
  child.prototype = new Surrogate();
  extend(child.prototype, properties);
  return child;
};


/**
 * Augment Provider's prototype.
 */

extend(Provider.prototype, {

  /**
   * Default settings for the provider.
   */

  options : {},


  /**
   * The single required API key for the provider. This lets us support a terse
   * initialization syntax:
   *
   *     analytics.initialize({
   *       'Provider' : 'XXXXXXX'
   *     });
   *
   * Only add this if the provider has a _single_ required key.
   */

  key : undefined,


  /**
   * Initialize our provider.
   *
   * @param {Object} options - the settings for the provider.
   * @param {Function} ready - a ready callback to call when we're ready to
   * start accept analytics method calls.
   */
  initialize : function (options, ready) {
    ready();
  },


  /**
   * Adds an item to the our internal pre-ready queue.
   *
   * @param {String} method - the analytics method to call (eg. 'track').
   * @param {Object} args - the arguments to pass to the method.
   */
  enqueue : function (method, args) {
    this.queue.push({
      method : method,
      args : args
    });
  }

});
});
require.register("analytics/src/user.js", function(exports, require, module){
var bindAll    = require('bind-all')
  , clone      = require('clone')
  , cookie     = require('./cookie')
  , defaults   = require('defaults')
  , extend     = require('extend')
  , localStore = require('./localStore');


function User (options) {
  this._id     = null;
  this._traits = {};
  this.options(options);
}


/**
 * Sets the options for the user
 *
 * @param  {Object} options
 *   @field {Object}  cookie
 *   @field {Object}  localStorage
 *   @field {Boolean} persist (true)
 */

User.prototype.options = function (options) {
  options || (options = {});

  defaults(options, {
    persist : true
  });

  this.cookie(options.cookie);
  this.localStorage(options.localStorage);
  this.persist = options.persist;
};


/**
 * Get or set cookie options
 *
 * @param  {Object} options
 */

User.prototype.cookie = function (options) {
  if (arguments.length === 0) return this.cookieOptions;

  options || (options = {});
  defaults(options, {
    key    : 'ajs_user_id',
    oldKey : 'ajs_user'
  });
  this.cookieOptions = options;
};


/**
 * Get or set local storage options
 *
 * @param  {Object} options
 */

User.prototype.localStorage = function (options) {
  if (arguments.length === 0) return this.localStorageOptions;

  options || (options = {});
  defaults(options, {
    key    : 'ajs_user_traits'
  });
  this.localStorageOptions = options;
};


/**
 * Get or set the user id
 *
 * @param  {String} id
 */

User.prototype.id = function (id) {
  if (arguments.length === 0) return this._id;
  this._id = id;
};


/**
 * Get or set the user traits
 *
 * @param  {Object} traits
 */

User.prototype.traits = function (traits) {
  if (arguments.length === 0) return clone(this._traits);
  traits || (traits = {});

  this._traits = traits;
};


/**
 * Updates the current stored user with id and traits.
 *
 * @param {String} userId - the new user ID.
 * @param {Object} traits - any new traits.
 * @return {Boolean} whether alias should be called.
 */

User.prototype.update = function (userId, traits) {

  // Make an alias call if there was no previous userId, there is one
  // now, and we are using a cookie between page loads.
  var alias = !this.id() && userId && this.persist;

  traits || (traits = {});

  // If there is a current user and the new user isn't the same,
  // we want to just replace their traits. Otherwise extend.
  if (this.id() && userId && this.id() !== userId) this.traits(traits);
  else this.traits(extend(this.traits(), traits));

  if (userId) this.id(userId);

  this.save();

  return alias;
};


/**
 * Save the user to localstorage and cookie
 *
 * @return {Boolean} saved
 */

User.prototype.save = function () {
  if (!this.persist) return false;

  cookie.set(this.cookie().key, this.id());
  localStore.set(this.localStorage().key, this.traits());
  return true;
};


/**
 * Loads a saved user, and set its information
 *
 * @return {Object} user
 */

User.prototype.load = function () {
  if (this.loadOldCookie()) return this.toJSON();

  var id     = cookie.get(this.cookie().key)
    , traits = localStore.get(this.localStorage().key);

  this.id(id);
  this.traits(traits);
  return this.toJSON();
};


/**
 * Clears the user, and removes the stored version
 *
 */

User.prototype.clear = function () {
  cookie.remove(this.cookie().key);
  localStore.remove(this.localStorage().key);
  this.id(null);
  this.traits({});
};


/**
 * Load the old user from the cookie. Should be phased
 * out at some point
 *
 * @return {Boolean} loaded
 */

User.prototype.loadOldCookie = function () {
  var user = cookie.get(this.cookie().oldKey);
  if (!user) return false;

  this.id(user.id);
  this.traits(user.traits);
  cookie.remove(this.cookie().oldKey);
  return true;
};


/**
 * Get the user info
 *
 * @return {Object}
 */

User.prototype.toJSON = function () {
  return {
    id     : this.id(),
    traits : this.traits()
  };
};


/**
 * Export the new user as a singleton.
 */

module.exports = bindAll(new User());

});
require.register("analytics/src/utils.js", function(exports, require, module){
// A helper to track events based on the 'anjs' url parameter
exports.getUrlParameter = function (urlSearchParameter, paramKey) {
  var params = urlSearchParameter.replace('?', '').split('&');
  for (var i = 0; i < params.length; i += 1) {
    var param = params[i].split('=');
    if (param.length === 2 && param[0] === paramKey) {
      return decodeURIComponent(param[1]);
    }
  }
};
});
require.register("analytics/src/providers/google-analytics.js", function(exports, require, module){
// https://developers.google.com/analytics/devguides/collection/gajs/

var Provider  = require('../provider')
  , load      = require('load-script')
  , type      = require('type')
  , url       = require('url')
  , canonical = require('canonical');


module.exports = Provider.extend({

  name : 'Google Analytics',

  key : 'trackingId',

  defaults : {
    // Whether to anonymize the IP address collected for the user.
    anonymizeIp : false,
    // An optional domain setting, to restrict where events can originate from.
    domain : null,
    // Whether to enable GOogle's DoubleClick remarketing feature.
    doubleClick : false,
    // Whether to use Google Analytics's Enhanced Link Attribution feature:
    // http://support.google.com/analytics/bin/answer.py?hl=en&answer=2558867
    enhancedLinkAttribution : false,
    // A domain to ignore for referrers. Maps to _addIgnoredRef
    ignoreReferrer : null,
    // Whether or not to track and initial pageview when initialized.
    initialPageview : true,
    // The setting to use for Google Analytics's Site Speed Sample Rate feature:
    // https://developers.google.com/analytics/devguides/collection/gajs/methods/gaJSApiBasicConfiguration#_gat.GA_Tracker_._setSiteSpeedSampleRate
    siteSpeedSampleRate : null,
    // Your Google Analytics Tracking ID.
    trackingId : null,
    // Whether you're using the new Universal Analytics or not.
    universalClient: false
  },

  initialize : function (options, ready) {
    if (options.universalClient) this.initializeUniversal(options, ready);
    else this.initializeClassic(options, ready);
  },

  initializeClassic: function (options, ready) {
    window._gaq = window._gaq || [];
    window._gaq.push(['_setAccount', options.trackingId]);

    // Apply a bunch of optional settings.
    if (options.domain) {
      window._gaq.push(['_setDomainName', options.domain]);
    }
    if (options.enhancedLinkAttribution) {
      var protocol = 'https:' === document.location.protocol ? 'https:' : 'http:';
      var pluginUrl = protocol + '//www.google-analytics.com/plugins/ga/inpage_linkid.js';
      window._gaq.push(['_require', 'inpage_linkid', pluginUrl]);
    }
    if (type(options.siteSpeedSampleRate) === 'number') {
      window._gaq.push(['_setSiteSpeedSampleRate', options.siteSpeedSampleRate]);
    }
    if (options.anonymizeIp) {
      window._gaq.push(['_gat._anonymizeIp']);
    }
    if (options.ignoreReferrer) {
      window._gaq.push(['_addIgnoredRef', options.ignoreReferrer]);
    }
    if (options.initialPageview) {
      var path, canon = canonical();
      if (canon) path = url.parse(canon).pathname;
      this.pageview(path);
    }

    // URLs change if DoubleClick is on. Even though Google Analytics makes a
    // queue, the `_gat` object isn't available until the library loads.
    if (options.doubleClick) {
      load('//stats.g.doubleclick.net/dc.js', ready);
    } else {
      load({
        http  : 'http://www.google-analytics.com/ga.js',
        https : 'https://ssl.google-analytics.com/ga.js'
      }, ready);
    }
  },

  initializeUniversal: function (options, ready) {

    // GA-universal lets you set your own queue name
    var global = this.global = 'ga';

    // and needs to know about this queue name in this special object
    // so that future plugins can also operate on the object
    window['GoogleAnalyticsObject'] = global;

    // setup the global variable
    window[global] = window[global] || function () {
      (window[global].q = window[global].q || []).push(arguments);
    };

    // GA also needs to know the current time (all from their snippet)
    window[global].l = 1 * new Date();

    var createOpts = {};

    // Apply a bunch of optional settings.
    if (options.domain)
      createOpts.cookieDomain = options.domain || 'none';
    if (type(options.siteSpeedSampleRate) === 'number')
      createOpts.siteSpeedSampleRate = options.siteSpeedSampleRate;
    if (options.anonymizeIp)
      ga('set', 'anonymizeIp', true);

    ga('create', options.trackingId, createOpts);

    if (options.initialPageview) {
      var path, canon = canonical();
      if (canon) path = url.parse(canon).pathname;
      this.pageview(path);
    }

    load('//www.google-analytics.com/analytics.js');

    // Google makes a queue so it's ready immediately.
    ready();
  },

  track : function (event, properties) {
    properties || (properties = {});

    var value;

    // Since value is a common property name, ensure it is a number and Google
    // requires that it be an integer.
    if (type(properties.value) === 'number') value = Math.round(properties.value);

    // Try to check for a `category` and `label`. A `category` is required,
    // so if it's not there we use `'All'` as a default. We can safely push
    // undefined if the special properties don't exist. Try using revenue
    // first, but fall back to a generic `value` as well.
    if (this.options.universalClient) {
      var opts = {};
      if (properties.noninteraction) opts.nonInteraction = properties.noninteraction;
      window[this.global](
        'send',
        'event',
        properties.category || 'All',
        event,
        properties.label,
        Math.round(properties.revenue) || value,
        opts
      );
    } else {
      window._gaq.push([
        '_trackEvent',
        properties.category || 'All',
        event,
        properties.label,
        Math.round(properties.revenue) || value,
        properties.noninteraction
      ]);
    }
  },

  pageview : function (url) {
    if (this.options.universalClient) {
      window[this.global]('send', 'pageview', url);
    } else {
      window._gaq.push(['_trackPageview', url]);
    }
  }

});
});
require.register("analytics/src/providers/optimizely.js", function(exports, require, module){
// https://www.optimizely.com/docs/api

var each      = require('each')
  , nextTick  = require('next-tick')
  , Provider  = require('../provider');


module.exports = Provider.extend({

  name : 'Optimizely',

  defaults : {
    // Whether to replay variations into other enabled integrations as traits.
    variations : true
  },

  initialize : function (options, ready, analytics) {
    // Create the `optimizely` object in case it doesn't exist already.
    // https://www.optimizely.com/docs/api#function-calls
    window.optimizely = window.optimizely || [];

    // If the `variations` option is true, replay our variations on the next
    // tick to wait for the entire library to be ready for replays.
    if (options.variations) {
      var self = this;
      nextTick(function () { self.replay(); });
    }

    // Optimizely should be on the page already, so it's always ready.
    ready();
  },

  track : function (event, properties) {
    // Optimizely takes revenue as cents, not dollars.
    if (properties && properties.revenue) properties.revenue = properties.revenue * 100;

    window.optimizely.push(['trackEvent', event, properties]);
  },

  replay : function () {
    // Make sure we have access to Optimizely's `data` dictionary.
    var data = window.optimizely.data;
    if (!data) return;

    // Grab a few pieces of data we'll need for replaying.
    var experiments       = data.experiments
      , variationNamesMap = data.state.variationNamesMap;

    // Create our traits object to add variations to.
    var traits = {};

    // Loop through all the experiement the user has been assigned a variation
    // for and add them to our traits.
    each(variationNamesMap, function (experimentId, variation) {
      traits['Experiment: ' + experiments[experimentId].name] = variation;
    });

    this.analytics.identify(traits);
  }

});
});
require.register("analytics/src/providers/index.js", function(exports, require, module){
module.exports = [
  require('./google-analytics'),
  require('./lytics'),
  require('./optimizely')
];

});
require.register("analytics/src/providers/lytics.js", function(exports, require, module){
// Lytics
// --------
// [Documentation](http://admin.lytics.io/doc#jstag),

var Provider = require('../provider')
  , extend   = require('extend')
  , load     = require('load-script');


module.exports = Provider.extend({

  name : 'Lytics',

  key : 'cid',

  defaults : {
    // Account identifier (required)
    cid: null,
    // Collector URL
    url: '//c.lytics.io',
    // How long to give collector requests
    delay: 200,
    // Cookie name storing unique identifier
    cookie: 'seerid',
    // Lytics data stream (optional), a string identifier of this data type
    stream: null,
    // Length of time before considering a session inactive
    sessecs: 1800,
    // Transport mechanism: 'Form' or 'Gif'
    channel: 'Form',
    // Query string parameters to automatically to events
    qsargs: [],
    // Whether to load minified or unminified source
    minified: true,
    // Should we capture initial Page view on load?
    initialPageview: true
  },

  initialize : function (options, ready) {
    window.jstag = (function () {
      var t = {
        _q: [],
        _c: extend(options),
        ts: (new Date()).getTime()
      };
      t.send = function() {
        this._q.push([ 'ready', 'send', Array.prototype.slice.call(arguments) ]);
        return this;
      };
      return t;
    })();

    load(options.url + '/static/io' + (options.minified ? '.min' : '') + '.js');

    if (options.initialPageview) {
      this.pageview();
    }

    ready();
  },

  identify: function (userId, traits) {
    traits._uid = userId;
    window.jstag.send(traits);
  },

  track: function (event, properties) {
    properties._e = event;
    window.jstag.send(properties);
  },

  pageview: function (url) {
    window.jstag.send();
  }

});
});




















































require.alias("avetisk-defaults/index.js", "analytics/deps/defaults/index.js");
require.alias("avetisk-defaults/index.js", "defaults/index.js");

require.alias("component-clone/index.js", "analytics/deps/clone/index.js");
require.alias("component-clone/index.js", "clone/index.js");
require.alias("component-type/index.js", "component-clone/deps/type/index.js");

require.alias("component-cookie/index.js", "analytics/deps/cookie/index.js");
require.alias("component-cookie/index.js", "cookie/index.js");

require.alias("component-each/index.js", "analytics/deps/each/index.js");
require.alias("component-each/index.js", "each/index.js");
require.alias("component-type/index.js", "component-each/deps/type/index.js");

require.alias("component-event/index.js", "analytics/deps/event/index.js");
require.alias("component-event/index.js", "event/index.js");

require.alias("component-inherit/index.js", "analytics/deps/inherit/index.js");
require.alias("component-inherit/index.js", "inherit/index.js");

require.alias("component-object/index.js", "analytics/deps/object/index.js");
require.alias("component-object/index.js", "object/index.js");

require.alias("component-querystring/index.js", "analytics/deps/querystring/index.js");
require.alias("component-querystring/index.js", "querystring/index.js");
require.alias("component-trim/index.js", "component-querystring/deps/trim/index.js");

require.alias("component-type/index.js", "analytics/deps/type/index.js");
require.alias("component-type/index.js", "type/index.js");

require.alias("component-url/index.js", "analytics/deps/url/index.js");
require.alias("component-url/index.js", "url/index.js");

require.alias("segmentio-after/index.js", "analytics/deps/after/index.js");
require.alias("segmentio-after/index.js", "after/index.js");

require.alias("segmentio-alias/index.js", "analytics/deps/alias/index.js");
require.alias("segmentio-alias/index.js", "alias/index.js");

require.alias("segmentio-bind-all/index.js", "analytics/deps/bind-all/index.js");
require.alias("segmentio-bind-all/index.js", "analytics/deps/bind-all/index.js");
require.alias("segmentio-bind-all/index.js", "bind-all/index.js");
require.alias("component-bind/index.js", "segmentio-bind-all/deps/bind/index.js");

require.alias("component-type/index.js", "segmentio-bind-all/deps/type/index.js");

require.alias("segmentio-bind-all/index.js", "segmentio-bind-all/index.js");
require.alias("segmentio-canonical/index.js", "analytics/deps/canonical/index.js");
require.alias("segmentio-canonical/index.js", "canonical/index.js");

require.alias("segmentio-extend/index.js", "analytics/deps/extend/index.js");
require.alias("segmentio-extend/index.js", "extend/index.js");

require.alias("segmentio-is-email/index.js", "analytics/deps/is-email/index.js");
require.alias("segmentio-is-email/index.js", "is-email/index.js");

require.alias("segmentio-is-meta/index.js", "analytics/deps/is-meta/index.js");
require.alias("segmentio-is-meta/index.js", "is-meta/index.js");

require.alias("segmentio-json/index.js", "analytics/deps/json/index.js");
require.alias("segmentio-json/index.js", "json/index.js");
require.alias("component-json-fallback/index.js", "segmentio-json/deps/json-fallback/index.js");

require.alias("segmentio-load-date/index.js", "analytics/deps/load-date/index.js");
require.alias("segmentio-load-date/index.js", "load-date/index.js");

require.alias("segmentio-load-script/index.js", "analytics/deps/load-script/index.js");
require.alias("segmentio-load-script/index.js", "load-script/index.js");
require.alias("component-type/index.js", "segmentio-load-script/deps/type/index.js");

require.alias("segmentio-new-date/index.js", "analytics/deps/new-date/index.js");
require.alias("segmentio-new-date/index.js", "new-date/index.js");
require.alias("component-type/index.js", "segmentio-new-date/deps/type/index.js");

require.alias("segmentio-on-body/index.js", "analytics/deps/on-body/index.js");
require.alias("segmentio-on-body/index.js", "on-body/index.js");
require.alias("component-each/index.js", "segmentio-on-body/deps/each/index.js");
require.alias("component-type/index.js", "component-each/deps/type/index.js");

require.alias("segmentio-store.js/store.js", "analytics/deps/store/store.js");
require.alias("segmentio-store.js/store.js", "analytics/deps/store/index.js");
require.alias("segmentio-store.js/store.js", "store/index.js");
require.alias("segmentio-json/index.js", "segmentio-store.js/deps/json/index.js");
require.alias("component-json-fallback/index.js", "segmentio-json/deps/json-fallback/index.js");

require.alias("segmentio-store.js/store.js", "segmentio-store.js/index.js");
require.alias("segmentio-top-domain/index.js", "analytics/deps/top-domain/index.js");
require.alias("segmentio-top-domain/index.js", "analytics/deps/top-domain/index.js");
require.alias("segmentio-top-domain/index.js", "top-domain/index.js");
require.alias("component-url/index.js", "segmentio-top-domain/deps/url/index.js");

require.alias("segmentio-top-domain/index.js", "segmentio-top-domain/index.js");
require.alias("timoxley-next-tick/index.js", "analytics/deps/next-tick/index.js");
require.alias("timoxley-next-tick/index.js", "next-tick/index.js");

require.alias("yields-prevent/index.js", "analytics/deps/prevent/index.js");
require.alias("yields-prevent/index.js", "prevent/index.js");

require.alias("analytics/src/indexShim.js", "analytics/index.js");if (typeof exports == "object") {
  module.exports = require("analytics");
} else if (typeof define == "function" && define.amd) {
  define([], function(){ return require("analytics"); });
} else {
  this["analytics"] = require("analytics");
}})();