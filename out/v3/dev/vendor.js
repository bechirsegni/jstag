/* istanbul ignore next */
'object' != typeof JSON && (JSON = {}), function () {
    'use strict';
    function f$1166(t) {
        return 10 > t ? '0' + t : t;
    }
    function this_value$1167() {
        return this.valueOf();
    }
    function quote$1168(t) {
        return rx_escapable$1175.lastIndex = 0, rx_escapable$1175.test(t) ? '"' + t.replace(rx_escapable$1175, function (t$2) {
            var e = meta$1180[t$2];
            return 'string' == typeof e ? e : '\\u' + ('0000' + t$2.charCodeAt(0).toString(16)).slice(-4);
        }) + '"' : '"' + t + '"';
    }
    function str$1170(t, e) {
        var r, n, o, u, f, a = gap$1178, i = e[t];
        switch (i && 'object' == typeof i && 'function' == typeof i.toJSON && (i = i.toJSON(t)), 'function' == typeof rep$1181 && (i = rep$1181.call(e, t, i)), typeof i) {
        case 'string':
            return quote$1168(i);
        case 'number':
            return isFinite(i) ? String(i) : 'null';
        case 'boolean':
        case 'null':
            return String(i);
        case 'object':
            if (!i)
                return 'null';
            if (gap$1178 += indent$1179, f = [], '[object Array]' === Object.prototype.toString.apply(i)) {
                for (u = i.length, r = 0; u > r; r += 1)
                    f[r] = str$1170(r, i) || 'null';
                return o = 0 === f.length ? '[]' : gap$1178 ? '[\n' + gap$1178 + f.join(',\n' + gap$1178) + '\n' + a + ']' : '[' + f.join(',') + ']', gap$1178 = a, o;
            }
            if (rep$1181 && 'object' == typeof rep$1181)
                for (u = rep$1181.length, r = 0; u > r; r += 1)
                    'string' == typeof rep$1181[r] && (n = rep$1181[r], o = str$1170(n, i), o && f.push(quote$1168(n) + (gap$1178 ? ': ' : ':') + o));
            else
                for (n in i)
                    Object.prototype.hasOwnProperty.call(i, n) && (o = str$1170(n, i), o && f.push(quote$1168(n) + (gap$1178 ? ': ' : ':') + o));
            return o = 0 === f.length ? '{}' : gap$1178 ? '{\n' + gap$1178 + f.join(',\n' + gap$1178) + '\n' + a + '}' : '{' + f.join(',') + '}', gap$1178 = a, o;
        }
    }
    var rx_one$1171 = /^[\],:{}\s]*$/, rx_two$1172 = /\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, rx_three$1173 = /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, rx_four$1174 = /(?:^|:|,)(?:\s*\[)+/g, rx_escapable$1175 = /[\\\"\u0000-\u001f\u007f-\u009f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g, rx_dangerous$1176 = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;
    'function' != typeof Date.prototype.toJSON && (Date.prototype.toJSON = function () {
        return isFinite(this.valueOf()) ? this.getUTCFullYear() + '-' + f$1166(this.getUTCMonth() + 1) + '-' + f$1166(this.getUTCDate()) + 'T' + f$1166(this.getUTCHours()) + ':' + f$1166(this.getUTCMinutes()) + ':' + f$1166(this.getUTCSeconds()) + 'Z' : null;
    }, Boolean.prototype.toJSON = this_value$1167, Number.prototype.toJSON = this_value$1167, String.prototype.toJSON = this_value$1167);
    var gap$1178, indent$1179, meta$1180, rep$1181;
    'function' != typeof JSON.stringify && (meta$1180 = {
        '\b': '\\b',
        '\t': '\\t',
        '\n': '\\n',
        '\f': '\\f',
        '\r': '\\r',
        '"': '\\"',
        '\\': '\\\\'
    }, JSON.stringify = function (t, e, r) {
        var n;
        if (gap$1178 = '', indent$1179 = '', 'number' == typeof r)
            for (n = 0; r > n; n += 1)
                indent$1179 += ' ';
        else
            'string' == typeof r && (indent$1179 = r);
        if (rep$1181 = e, e && 'function' != typeof e && ('object' != typeof e || 'number' != typeof e.length))
            throw new Error('JSON.stringify');
        return str$1170('', { '': t });
    }), 'function' != typeof JSON.parse && (JSON.parse = function (text$1202, reviver$1203) {
        function walk$1205(t, e) {
            var r, n, o = t[e];
            if (o && 'object' == typeof o)
                for (r in o)
                    Object.prototype.hasOwnProperty.call(o, r) && (n = walk$1205(o, r), void 0 !== n ? o[r] = n : delete o[r]);
            return reviver$1203.call(t, e, o);
        }
        var j$1206;
        if (text$1202 = String(text$1202), rx_dangerous$1176.lastIndex = 0, rx_dangerous$1176.test(text$1202) && (text$1202 = text$1202.replace(rx_dangerous$1176, function (t) {
                return '\\u' + ('0000' + t.charCodeAt(0).toString(16)).slice(-4);
            })), rx_one$1171.test(text$1202.replace(rx_two$1172, '@').replace(rx_three$1173, ']').replace(rx_four$1174, '')))
            return j$1206 = eval('(' + text$1202 + ')'), 'function' == typeof reviver$1203 ? walk$1205({ '': j$1206 }, '') : j$1206;
        throw new SyntaxError('JSON.parse');
    });
}();