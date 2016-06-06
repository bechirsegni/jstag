// verify that the core async tag gets loaded and has the necessary functions defined
describe("io:initialization", function() {
  it("jstag should exist but should not be loaded", function() {
    // validate
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

// ensure the parse event function can handle all the send/mock payload possibilities
describe("io:parseEvent", function() {
  var resp, cb, obj;
  cb = function(){console.log('here');};
  obj = {"test":"one"};

  it("should create the correct payload from a wide variety of send/mock events", function() {
    // no object : invalid call
    resp = jstag.parseEvent();
    expect(resp).toEqual({ data: undefined, callback: undefined, stream: undefined, mock: false });

    // just a stream and no object : invalid call
    resp = jstag.parseEvent();
    expect(jstag.parseEvent("fakestream")).toEqual({ data: undefined, callback: undefined, stream: "fakestream", mock: false });

    // just a callback and no object : invalid call
    resp = jstag.parseEvent(cb);
    expect(resp).toEqual({ data: undefined, callback: cb, stream: undefined, mock: false });

    // just a boolean and no object : invalid call
    resp = jstag.parseEvent(true);
    expect(resp).toEqual({ data: undefined, callback: undefined, stream: undefined, mock: true });

    // just an object
    resp = jstag.parseEvent(obj);
    expect(resp).toEqual({ data: obj, callback: undefined, stream: undefined, mock: false });

    // stream and object
    resp = jstag.parseEvent("mystream", obj);
    expect(resp).toEqual({ data: obj, callback: undefined, stream: "mystream", mock: false });

    // object and callback
    resp = jstag.parseEvent(obj, cb);
    expect(resp).toEqual({ data: obj, callback: cb, stream: undefined, mock: false });

    // object and mock boolean
    resp = jstag.parseEvent(obj, true);
    expect(resp).toEqual({ data: obj, callback: undefined, stream: undefined, mock: true });

    // stream object and callback
    resp = jstag.parseEvent("mystream", obj, cb);
    expect(resp).toEqual({ data: obj, callback: cb, stream: "mystream", mock: false });

    // object callback and mock boolean
    resp = jstag.parseEvent(obj, cb, true);
    expect(resp).toEqual({ data: obj, callback: cb, stream: undefined, mock: true });

    // stream object callback and mock boolean
    resp = jstag.parseEvent("mystream", obj, cb, true);
    expect(resp).toEqual({ data: obj, callback: cb, stream: "mystream", mock: true });

    // random order stream object callback and mock boolean
    resp = jstag.parseEvent(obj, "mystream", true, cb);
    expect(resp).toEqual({ data: obj, callback: cb, stream: "mystream", mock: true });
  });
});

// Specs
describe("Testing async calls with beforeEach and passing the special done callback around", function () {

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

  it("Should be true if the async call has completed", function () {
      // first send should not include uid, but does include sesstart
      expect(async1.dataMsg).toEqual('one=one&_nmob=t&_device=desktop&url=localhost%3A9976%2Fcontext.html&_if=t&_v=1.31&_e=pv&_sesstart=1&_tz=-7&_ul=en-US&_sz=1024x768&_ca=jstag1');

      // future sends should not include session but do include new _uid
      expect(async2.dataMsg).toEqual('two=one&_nmob=t&_device=desktop&url=localhost%3A9976%2Fcontext.html&_if=t&_uid=' + async2.data._uid + '&_getid=t&_v=1.31&_ca=jstag1');
      expect(async3.dataMsg).toEqual('three=one&_nmob=t&_device=desktop&url=localhost%3A9976%2Fcontext.html&_if=t&_uid=' + async3.data._uid + '&_getid=t&_v=1.31&_ca=jstag1');
      expect(async4.dataMsg).toEqual('four=one&_nmob=t&_device=desktop&url=localhost%3A9976%2Fcontext.html&_if=t&_uid=' + async4.data._uid + '&_getid=t&_v=1.31&_ca=jstag1');
  });

});