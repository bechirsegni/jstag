describe("verify that the core async tag gets loaded and has the necessary functions defined", function() {
  it("jstag should exist but should not be loaded", function() {
    expect(window.jstag).toBeDefined();
    expect(window.jstag.isLoaded).toBe(true);
  });

  it("should have the proper functions defined", function(){
    expect(window.jstag.init).toBeDefined();
    expect(window.jstag.load).toBeDefined();
    expect(window.jstag.bind).toBeDefined();
    expect(window.jstag.ready).toBeDefined();
    expect(window.jstag.send).toBeDefined();
  });
});

describe("ensure the parse event function can handle all the send/mock payload possibilities", function() {
  var resp, cb, obj;
  cb = function(){console.log('here');};
  obj = {"test":"one"};

  it("should create the correct payload from a wide variety of send/mock events", function() {
    // no object : invalid call
    resp = jstag.parseEvent();
    expect(resp).toEqual({ data: {}, callback: undefined, stream: "default", mock: false });

    // just a stream and no object : invalid call
    resp = jstag.parseEvent();
    expect(jstag.parseEvent("fakestream")).toEqual({ data: {}, callback: undefined, stream: "fakestream", mock: false });

    // just a callback and no object : invalid call
    resp = jstag.parseEvent(cb);
    expect(resp).toEqual({ data: {}, callback: cb, stream: "default", mock: false });

    // just a boolean and no object : invalid call
    resp = jstag.parseEvent(true);
    expect(resp).toEqual({ data: {}, callback: undefined, stream: "default", mock: true });

    // just an object
    resp = jstag.parseEvent(obj);
    expect(resp).toEqual({ data: obj, callback: undefined, stream: "default", mock: false });

    // stream and object
    resp = jstag.parseEvent("mystream", obj);
    expect(resp).toEqual({ data: obj, callback: undefined, stream: "mystream", mock: false });

    // object and callback
    resp = jstag.parseEvent(obj, cb);
    expect(resp).toEqual({ data: obj, callback: cb, stream: "default", mock: false });

    // object and mock boolean
    resp = jstag.parseEvent(obj, true);
    expect(resp).toEqual({ data: obj, callback: undefined, stream: "default", mock: true });

    // stream object and callback
    resp = jstag.parseEvent("mystream", obj, cb);
    expect(resp).toEqual({ data: obj, callback: cb, stream: "mystream", mock: false });

    // object callback and mock boolean
    resp = jstag.parseEvent(obj, cb, true);
    expect(resp).toEqual({ data: obj, callback: cb, stream: "default", mock: true });

    // stream object callback and mock boolean
    resp = jstag.parseEvent("mystream", obj, cb, true);
    expect(resp).toEqual({ data: obj, callback: cb, stream: "mystream", mock: true });

    // random order stream object callback and mock boolean
    resp = jstag.parseEvent(obj, "mystream", true, cb);
    expect(resp).toEqual({ data: obj, callback: cb, stream: "mystream", mock: true });
  });
});

describe("testing the jstag.send and jstag.mock(wrapper) functions", function () {
  var async1, async2, async3, async4, count=0;

  function testSend(done) {
    jstag.send("teststream", {"one":"one"}, function(opts, self){
      async1 = opts;
      count++;
      if(count >= 4){
        done();
      }
    }, false);

    jstag.send("teststream", {"two":"one"}, function(opts, self){
      async2 = opts;
      count++;
      if(count >= 4){
        done();
      }
    }, true);

    jstag.mock("teststream", {"three":"one"}, function(opts, self){
      async3 = opts;
      count++;
      if(count >= 4){
        done();
      }
    }, true);

    jstag.mock("teststream", {"four":"one"}, function(opts, self){
      async4 = opts;
      count++;
      if(count >= 4){
        done();
      }
    }, true);
  }

  beforeEach(function (done) {
      testSend(done);
  });

  it("should be true if the async call has completed", function () {
      // first send should not include uid, but does include sesstart
      expect(async1.dataMsg).toEqual('one=one&_nmob=t&_device=desktop&url=localhost%3A9976%2Fcontext.html&_if=t&_v=1.31&_e=pv&_sesstart=1&_tz=-7&_ul=en-US&_sz=1024x768&_ca=jstag1');

      // future sends should not include session but do include new _uid
      expect(async2.dataMsg).toEqual('two=one&_nmob=t&_device=desktop&url=localhost%3A9976%2Fcontext.html&_if=t&_uid=' + async2.data._uid + '&_getid=t&_v=1.31&_ca=jstag1');
      expect(async3.dataMsg).toEqual('three=one&_nmob=t&_device=desktop&url=localhost%3A9976%2Fcontext.html&_if=t&_uid=' + async3.data._uid + '&_getid=t&_v=1.31&_ca=jstag1');
      expect(async4.dataMsg).toEqual('four=one&_nmob=t&_device=desktop&url=localhost%3A9976%2Fcontext.html&_if=t&_uid=' + async4.data._uid + '&_getid=t&_v=1.31&_ca=jstag1');
  });
});

describe("verify that we can properly process a pageview event", function () {
  var async1, count=0;

  function testPageView(done) {
    jstag.pageView("teststream", function(opts, self){
      async1 = opts;
      count++;
      if(count >= 1){
        done();
      }
    });
  }

  beforeEach(function (done) {
      testPageView(done);
  });

  it("should add and/or alter the _e param and start session", function () {
    expect(async1.dataMsg).toEqual('_e=pv&_sesstart=1&_tz=-7&_ul=en-US&_sz=1024x768&_nmob=t&_device=desktop&url=localhost%3A9976%2Fcontext.html&_if=t&_uid=' + async1.data._uid + '&_getid=t&_v=1.31&_ca=jstag1');
  });

  console.llog
});

describe("verify that we can properly process an identify event", function () {
  var async1, count=0;

  function testIdentify(done) {
    jstag.identify("myfakeuserid", function(opts, self){
      async1 = opts;
      count++;
      if(count >= 1){
        done();
      }
    });
  }

  beforeEach(function (done) {
      testIdentify(done);
  });

  it("should add the user_id param to identify the user", function () {
    expect(async1.dataMsg).toEqual('user_id=myfakeuserid&_nmob=t&_device=desktop&url=localhost%3A9976%2Fcontext.html&_if=t&_uid=' + async1.data._uid + '&_getid=t&_v=1.31&_ca=jstag1');
  });
});

describe("verify that we can block all sends and then flush the queue to handle state aware entity lookup", function() {
  var async1, count=0;

  function testSend(done) {
    jstag.send("streamname", {"test":"test"}, function(opts, self){
      async1 = opts;
      count++;
      if(count >= 1){
        done();
      }
    });
  }

  beforeEach(function (done) {
      window.jstag.block(false);
      testSend(done);
  });

  it("should not fill up the queue when the block flag is set to false", function() {
    expect(window.jstag.config.blockload).toBe(false);
    expect(window.jstag.config.payloadQueue.length).toEqual(0);
    expect(async1.dataMsg).toEqual('test=test&_nmob=t&_device=desktop&url=localhost%3A9976%2Fcontext.html&_if=t&_uid=' + async1.data._uid + '&_getid=t&_v=1.31&_ca=jstag1');
  });
});

describe("verify that events fire after they have been added to queue by block", function() {
  var async1, async2, count=0;

  function testSend(done) {
    jstag.block(true);

    jstag.send("streamname", {"test":"test"}, function(opts, self){
      async1 = opts;
      count++;
      if(count >= 2){
        done();
      }
    });

    jstag.send("streamname", {"test2":"test2"}, function(opts, self){
      async2 = opts;
      count++;
      if(count >= 2){
        done();
      }
    });

    expect(jstag.config.blockload).toBe(true);
    expect(jstag.config.payloadQueue.length).toEqual(2);

    jstag.block(false);
  }

  beforeEach(function (done) {
    testSend(done);
  });

  it("should receive outbound query params for previously blocked sends", function() {
    expect(async1.dataMsg).toEqual('test=test&_nmob=t&_device=desktop&url=localhost%3A9976%2Fcontext.html&_if=t&_uid=' + async1.data._uid + '&_getid=t&_v=1.31&_ca=jstag1');
    expect(async2.dataMsg).toEqual('test2=test2&_nmob=t&_device=desktop&url=localhost%3A9976%2Fcontext.html&_if=t&_uid=' + async2.data._uid + '&_getid=t&_v=1.31&_ca=jstag1');
  });
});

describe("verify that all blocked events in the queue are added the the payload of the mock call", function() {
  var async1;

  function testSend(done) {
    jstag.block(true);

    jstag.send("streamname", {"test":"test"});
    jstag.send("streamname", {"test2":"test2"});

    expect(jstag.config.blockload).toBe(true);
    expect(jstag.config.payloadQueue.length).toEqual(2);

    jstag.mock("streamname", {"test3":"test3"}, function(opts, self){
      async1 = opts;
      done();
    });
  }

  beforeEach(function (done) {
    testSend(done);
  });

  it("should merge the payload from the two blocked events and one mock event", function() {
    expect(async1.dataMsg).toEqual('test=test&test2=test2&test3=test3&_nmob=t&_device=desktop&url=localhost%3A9976%2Fcontext.html&_if=t&_uid=' + async1.data._uid + '&_getid=t&_v=1.31&_ca=jstag1');
  });
});

describe("verify that we can get and set cookies as well as that the core cookies are set (seerid and seerses)", function() {
  it("should have core lytics cookies", function() {
    expect(jstag.ckieGet('seerses')).toBeTruthy();
    expect(jstag.ckieGet('seerid')).toBeTruthy();
  });

  it("should be able to set cookies on the domain", function() {
    jstag.ckieSet('testone', 'one');
    jstag.ckieSet('testtwo', 'two');
    expect(jstag.ckieGet('testone')).toEqual('one');
    expect(jstag.ckieGet('testtwo')).toEqual('two');
  });
});

describe("verify that our extend method works on multiple objects", function() {
  it("should extend an empty object", function() {
    var test = {}, resp = jstag.extend(test, {"one":1, "two":2});
    expect(resp.one).toEqual(1);
    expect(resp.two).toEqual(2);

    // make sure we dont mutate
    expect(test).toEqual({});
  });

  it("should extend an existing object", function() {
    var test = {"one":"imgettingremoved", "three":3}, resp = jstag.extend(test, {"one":1, "two":2});
    expect(resp.one).toEqual(1);
    expect(resp.two).toEqual(2);
    expect(resp.three).toEqual(3);

    // make sure we dont mutate
    expect(test).toEqual({"one":"imgettingremoved", "three":3});
  });

  it("should accept multiple objects at once", function() {
    var testa = {"one":"imgettingremoved", "two":2},
        testb = {"one":"imheretostay", "two":"one"},
        testc = {"two":"two", "three":{"a":"a", "b":"b"}},
        resp = jstag.extend(testa, testb, testc);

    expect(resp.one).toEqual("imheretostay");
    expect(resp.two).toEqual("two");
    expect(resp.three).toEqual({"a":"a", "b":"b"});

    // make sure we dont mutate
    expect(testa).toEqual({"one":"imgettingremoved", "two":2});
    expect(testb).toEqual({"one":"imheretostay", "two":"one"});
    expect(testc).toEqual({"two":"two", "three":{"a":"a", "b":"b"}});
  });
});

// process as gif
// describe("verify that all blocked events in the queue are added the the payload of the mock call", function() {
//   it("should merge the payload from the two blocked events and one mock event", function() {
//     expect(async1.dataMsg).toEqual('test=test&test2=test2&test3=test3&_nmob=t&_device=desktop&url=localhost%3A9976%2Fcontext.html&_if=t&_uid=' + async1.data._uid + '&_getid=t&_v=1.31&_ca=jstag1');
//   });
// }

// process as form
// describe("verify that all blocked events in the queue are added the the payload of the mock call", function() {
//   it("should merge the payload from the two blocked events and one mock event", function() {
//     expect(async1.dataMsg).toEqual('test=test&test2=test2&test3=test3&_nmob=t&_device=desktop&url=localhost%3A9976%2Fcontext.html&_if=t&_uid=' + async1.data._uid + '&_getid=t&_v=1.31&_ca=jstag1');
//   });
// }

// handle multiple cids
// describe("verify that all blocked events in the queue are added the the payload of the mock call", function() {
//   it("should merge the payload from the two blocked events and one mock event", function() {
//     expect(async1.dataMsg).toEqual('test=test&test2=test2&test3=test3&_nmob=t&_device=desktop&url=localhost%3A9976%2Fcontext.html&_if=t&_uid=' + async1.data._uid + '&_getid=t&_v=1.31&_ca=jstag1');
//   });
// }

// handle array instead of object
// describe("verify that all blocked events in the queue are added the the payload of the mock call", function() {
//   it("should merge the payload from the two blocked events and one mock event", function() {
//     expect(async1.dataMsg).toEqual('test=test&test2=test2&test3=test3&_nmob=t&_device=desktop&url=localhost%3A9976%2Fcontext.html&_if=t&_uid=' + async1.data._uid + '&_getid=t&_v=1.31&_ca=jstag1');
//   });
// }