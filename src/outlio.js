window.jstag = function() {
  var t = {
    _q: [],
    _c: {},
    ts: (new Date()).getTime()
  },
  l = false,
  w = window,
  d = document,
  src = "/static/io",
  ext = ".min.js",
  as = Array.prototype.slice,
  js = "//api.lytics.io" || "//c.lytics.io",
  url = "//api.lytics.io" || "//c.lytics.io",
  tag = "io",
  ver = "1.0";
  t.init = function(c) {
    url = c.url || url;
    ext = c.min === false ? ".js" : ext;
    tag = c.tag || tag;
    t._c = c;
    return this;
  };
  t.load = function() {
    var jsel, scriptEl = d.getElementsByTagName("script")[0];
    l = true;
    if (d.getElementById(src)) return this;
    jsel = d.createElement("script");
    src = js + "/static/" + tag + ext;
    jsel.id = src;
    jsel.src = src;
    scriptEl.parentNode.insertBefore(jsel, scriptEl);
    return this;
  };
  t.bind = function(e) {
    if (!l) this.load();
    this._q.push([e, as.call(arguments, 1)]);
  };
  t.ready = function() {
    if (!l) this.load();
    this._q.push(["ready", as.call(arguments)]);
  };
  t.send = function() {
    if (!l) this.load();
    this._q.push(["ready", "send", as.call(arguments)]);
    return this;
  };
  return t;
}();