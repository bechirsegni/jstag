/* istanbul ignore next */
'object' != typeof JSON && (JSON = {}), function () {
    'use strict';
    function f$1173(t) {
        return 10 > t ? '0' + t : t;
    }
    function this_value$1174() {
        return this.valueOf();
    }
    function quote$1175(t) {
        return rx_escapable$1182.lastIndex = 0, rx_escapable$1182.test(t) ? '"' + t.replace(rx_escapable$1182, function (t$2) {
            var e = meta$1187[t$2];
            return 'string' == typeof e ? e : '\\u' + ('0000' + t$2.charCodeAt(0).toString(16)).slice(-4);
        }) + '"' : '"' + t + '"';
    }
    function str$1177(t, e) {
        var r, n, o, u, f, a = gap$1185, i = e[t];
        switch (i && 'object' == typeof i && 'function' == typeof i.toJSON && (i = i.toJSON(t)), 'function' == typeof rep$1188 && (i = rep$1188.call(e, t, i)), typeof i) {
        case 'string':
            return quote$1175(i);
        case 'number':
            return isFinite(i) ? String(i) : 'null';
        case 'boolean':
        case 'null':
            return String(i);
        case 'object':
            if (!i)
                return 'null';
            if (gap$1185 += indent$1186, f = [], '[object Array]' === Object.prototype.toString.apply(i)) {
                for (u = i.length, r = 0; u > r; r += 1)
                    f[r] = str$1177(r, i) || 'null';
                return o = 0 === f.length ? '[]' : gap$1185 ? '[\n' + gap$1185 + f.join(',\n' + gap$1185) + '\n' + a + ']' : '[' + f.join(',') + ']', gap$1185 = a, o;
            }
            if (rep$1188 && 'object' == typeof rep$1188)
                for (u = rep$1188.length, r = 0; u > r; r += 1)
                    'string' == typeof rep$1188[r] && (n = rep$1188[r], o = str$1177(n, i), o && f.push(quote$1175(n) + (gap$1185 ? ': ' : ':') + o));
            else
                for (n in i)
                    Object.prototype.hasOwnProperty.call(i, n) && (o = str$1177(n, i), o && f.push(quote$1175(n) + (gap$1185 ? ': ' : ':') + o));
            return o = 0 === f.length ? '{}' : gap$1185 ? '{\n' + gap$1185 + f.join(',\n' + gap$1185) + '\n' + a + '}' : '{' + f.join(',') + '}', gap$1185 = a, o;
        }
    }
    var rx_one$1178 = /^[\],:{}\s]*$/, rx_two$1179 = /\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, rx_three$1180 = /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, rx_four$1181 = /(?:^|:|,)(?:\s*\[)+/g, rx_escapable$1182 = /[\\\"\u0000-\u001f\u007f-\u009f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g, rx_dangerous$1183 = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;
    'function' != typeof Date.prototype.toJSON && (Date.prototype.toJSON = function () {
        return isFinite(this.valueOf()) ? this.getUTCFullYear() + '-' + f$1173(this.getUTCMonth() + 1) + '-' + f$1173(this.getUTCDate()) + 'T' + f$1173(this.getUTCHours()) + ':' + f$1173(this.getUTCMinutes()) + ':' + f$1173(this.getUTCSeconds()) + 'Z' : null;
    }, Boolean.prototype.toJSON = this_value$1174, Number.prototype.toJSON = this_value$1174, String.prototype.toJSON = this_value$1174);
    var gap$1185, indent$1186, meta$1187, rep$1188;
    'function' != typeof JSON.stringify && (meta$1187 = {
        '\b': '\\b',
        '\t': '\\t',
        '\n': '\\n',
        '\f': '\\f',
        '\r': '\\r',
        '"': '\\"',
        '\\': '\\\\'
    }, JSON.stringify = function (t, e, r) {
        var n;
        if (gap$1185 = '', indent$1186 = '', 'number' == typeof r)
            for (n = 0; r > n; n += 1)
                indent$1186 += ' ';
        else
            'string' == typeof r && (indent$1186 = r);
        if (rep$1188 = e, e && 'function' != typeof e && ('object' != typeof e || 'number' != typeof e.length))
            throw new Error('JSON.stringify');
        return str$1177('', { '': t });
    }), 'function' != typeof JSON.parse && (JSON.parse = function (text$1209, reviver$1210) {
        function walk$1212(t, e) {
            var r, n, o = t[e];
            if (o && 'object' == typeof o)
                for (r in o)
                    Object.prototype.hasOwnProperty.call(o, r) && (n = walk$1212(o, r), void 0 !== n ? o[r] = n : delete o[r]);
            return reviver$1210.call(t, e, o);
        }
        var j$1213;
        if (text$1209 = String(text$1209), rx_dangerous$1183.lastIndex = 0, rx_dangerous$1183.test(text$1209) && (text$1209 = text$1209.replace(rx_dangerous$1183, function (t) {
                return '\\u' + ('0000' + t.charCodeAt(0).toString(16)).slice(-4);
            })), rx_one$1178.test(text$1209.replace(rx_two$1179, '@').replace(rx_three$1180, ']').replace(rx_four$1181, '')))
            return j$1213 = eval('(' + text$1209 + ')'), 'function' == typeof reviver$1210 ? walk$1212({ '': j$1213 }, '') : j$1213;
        throw new SyntaxError('JSON.parse');
    });
}();