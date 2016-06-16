window.jstag = function() {
  var t = {
          _q: [],
          _c: {},
          ts: (new Date()).getTime(),
          ver: "{{asyncversion}}"
      },
      w = window,
      d = document,
      l = false,
      async = true,
      as = Array.prototype.slice;
  t.init = function(c) {
      t._c = c;

      // begin load of core tag
      // in > 2.0.0 this tag will handle loading io based on account
      // and no longer require changes to async tag
      if(!c.synchronous){
        t.loadtagmgr(c);
      }

      return this;
  };
  t.loadtagmgr = function(c){
    var newtag = document.createElement("script");
    newtag.type = "text/javascript", newtag.async = !0, newtag.src = c.url + "/api/tag/" + c.cid + "/lio.js";
    var i = document.getElementsByTagName("script")[0];
    i.parentNode.insertBefore(newtag, i)
  };
  t.ready = function() {
    this._q.push(["ready", as.call(arguments)]);
    return this;
  };
  t.bind = function(e) {
    this._q.push([e, as.call(arguments, 1)]);
  };
  t.send = function() {
    this._q.push(["ready", "send", as.call(arguments)]);
    return this;
  };
  t.mock = function() {
    this._q.push(["ready", "mock", as.call(arguments)]);
    return this;
  };
  t.identify = function() {
    this._q.push(["ready", "identify", as.call(arguments)]);
    return this;
  };
  t.pageView = function() {
    this._q.push(["ready", "pageView", as.call(arguments)]);
    return this;
  };
  t.block = function() {
    t._c.blockload = true;
    return this;
  };
  t.unblock = function() {
    t._c.blockload = false;
    return this;
  };
  return t;
}(),
window.jstag.init({{initobj}});