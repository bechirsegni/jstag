window.jstag = function () {
  var t = {
        _q: [],
        _c: {},
        ts: (new Date()).getTime(),
        ver: '2.0.0'
      },
      async = true,
      as = Array.prototype.slice;

  t.init = function (c) {
    t._c = c;

    // begin load of core tag
    // in > 2.0.0 this tag will handle loading io based on account
    // and no longer require changes to async tag
    if (!c.synchronous) {
      t.loadtagmgr(c);
    }

    return this;
  };

  t.loadtagmgr = function (c) {
    var newtag = document.createElement('script');
    newtag.type = 'text/javascript';
    newtag.async = !0;
    newtag.src = c.url + '/api/tag/' + c.cid + '/lio.js';

    var i = document.getElementsByTagName('script')[0];
    i.parentNode.insertBefore(newtag, i);
  };

  function chainable (fn) {
    return function () {
      fn.apply(this, arguments);
      return this;
    };
  }

  function queueStub () {
    var args = ['ready'].concat(as.call(arguments));
    return chainable(function () {
      args.push(as.call(arguments));
      this._q.push(args);
    });
  }

  t.ready = queueStub();

  t.send = queueStub('send');

  t.mock = queueStub('mock');

  t.identify = queueStub('identify');

  t.pageView = queueStub('pageView');

  t.bind = chainable(function (e) {
    t._q.push([e, as.call(arguments, 1)]);
  });

  t.block = chainable(function () {
    t._c.blockload = true;
  });

  t.unblock = chainable(function () {
    t._c.blockload = false;
  });

  return t;
}(),
window.jstag.init({
  cid: '{{account.id}}',
  url: '//c.lytics.io',
  min: true,
  loadid: false
});
