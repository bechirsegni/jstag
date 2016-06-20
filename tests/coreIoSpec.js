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
    jstag.send("teststream", {"one":"value1"}, function(opts){
      async1 = opts;
      count++;
      if(count >= 4){
        done();
      }
    }, false);

    jstag.send("teststream", {"two":"value2"}, function(opts){
      async2 = opts;
      count++;
      if(count >= 4){
        done();
      }
    }, true);

    jstag.mock("teststream", {"three":"value3"}, function(opts){
      async3 = opts;
      count++;
      if(count >= 4){
        done();
      }
    }, true);

    jstag.mock("teststream", {"four":"value4"}, function(opts){
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

  it("should send four calls with correct data as payload", function () {
      // first send should not include uid, but does include sesstart
      expect(async1.dataMsg).toEqual('one=value1&_ts=' + async1.data._ts + '&_nmob=t&_device=desktop&url=localhost%3A9876%2Fcontext.html&_if=t&_v='+window.__karma__.config.ioversion+'&_e=pv&_sesstart=1&_tz=-7&_ul=en-US&_sz=1024x768&_uid=' + async1.data._uid + '&_getid=t&_ca=jstag1');

      // future sends should not include session but do include new _uid
      expect(async2.dataMsg).toEqual('two=value2&_ts=' + async2.data._ts + '&_nmob=t&_device=desktop&url=localhost%3A9876%2Fcontext.html&_if=t&_uid=' + async2.data._uid + '&_getid=t&_v='+window.__karma__.config.ioversion+'&_ca=jstag1');
      expect(async3.dataMsg).toEqual('three=value3&_ts=' + async3.data._ts + '&_nmob=t&_device=desktop&url=localhost%3A9876%2Fcontext.html&_if=t&_uid=' + async3.data._uid + '&_getid=t&_v='+window.__karma__.config.ioversion+'&_ca=jstag1');
      expect(async4.dataMsg).toEqual('four=value4&_ts=' + async4.data._ts + '&_nmob=t&_device=desktop&url=localhost%3A9876%2Fcontext.html&_if=t&_uid=' + async4.data._uid + '&_getid=t&_v='+window.__karma__.config.ioversion+'&_ca=jstag1');
  });
});

describe("testing that jstag.send can handle an array in addition to an object", function () {
  var async1;

  function testSend(done) {
    jstag.send("teststream", [{"one":"value1"}, {"two":"value2"}], function(opts){
      async1 = opts;
      done();
    });
  }

  beforeEach(function (done) {
      testSend(done);
  });

  it("should translate the array into key/value pairs", function () {
    expect(async1.dataMsg).toEqual('0.one=value1&1.two=value2&_ts=' + async1.data._ts + '&_nmob=t&_device=desktop&url=localhost%3A9876%2Fcontext.html&_if=t&_uid=' + async1.data._uid + '&_getid=t&_v='+window.__karma__.config.ioversion+'&_ca=jstag1');
  });
});

describe("verify that we can properly process a pageview event", function () {
  var async1;

  function testPageView(done) {
    jstag.pageView("teststream", function(opts){
      async1 = opts;
      done();
    });
  }

  beforeEach(function (done) {
      testPageView(done);
  });

  it("should add and/or alter the _e param and start session", function () {
    expect(async1.dataMsg).toEqual('_e=pv&_sesstart=1&_tz=-7&_ul=en-US&_sz=1024x768&_ts=' + async1.data._ts + '&_nmob=t&_device=desktop&url=localhost%3A9876%2Fcontext.html&_if=t&_uid=' + async1.data._uid + '&_getid=t&_v='+window.__karma__.config.ioversion+'&_ca=jstag1');
  });
});

describe("verify that we can properly process an identify event", function () {
  var async1, count=0;

  function testIdentify(done) {
    jstag.identify("myfakeuserid", function(opts){
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
    expect(async1.channelName).toEqual('Gif');
    expect(async1.dataMsg).toEqual('_ts=' + async1.data._ts + '&_nmob=t&_device=desktop&url=localhost%3A9876%2Fcontext.html&_if=t&_uid=' + async1.data._uid + '&_getid=t&_v='+window.__karma__.config.ioversion+'&_ca=jstag1');
  });
});

describe("verify that we can process data using the alternative form method and that if default to form after 2k characters", function () {
  var async1;

  function testSend(done) {
    jstag.send("teststream", [{"_id":"57586b1e1ab582f01179cf46","index":0,"guid":"fbc0c1fc-3124-42fc-9139-c8688a678c00","isActive":false,"balance":"$1,249.57","picture":"http://placehold.it/32x32","age":28,"eyeColor":"blue","name":"Daphne Levy","gender":"female","company":"OMNIGOG","email":"daphnelevy@omnigog.com","phone":"+1 (953) 459-2087","address":"544 Tilden Avenue, Nipinnawasee, Maine, 4806","about":"Irure mollit nulla nostrud irure excepteur aliqua. Anim esse eu ipsum nulla eu esse enim ipsum consequat incididunt. Aliqua sunt Lorem do est aute enim.\r\n","registered":"2014-06-27T10:17:24 +07:00","latitude":10.164059,"longitude":62.296736,"tags":["magna","amet","non","reprehenderit","exercitation","nostrud","qui"],"friends":[{"id":0,"name":"Golden Mckay"},{"id":1,"name":"Mullins Baldwin"},{"id":2,"name":"Knight Tran"}],"greeting":"Hello, Daphne Levy! You have 10 unread messages.","favoriteFruit":"apple"},{"_id":"57586b1e78b157455a47772e","index":1,"guid":"719fe570-2c83-4e2c-83e1-9aa0d7e60aa7","isActive":false,"balance":"$2,394.87","picture":"http://placehold.it/32x32","age":34,"eyeColor":"green","name":"Lopez Phelps","gender":"male","company":"ACRUEX","email":"lopezphelps@acruex.com","phone":"+1 (962) 540-3722","address":"971 Pitkin Avenue, Selma, Massachusetts, 188","about":"Laborum magna ex pariatur esse aliqua. Aliqua commodo est enim nostrud in dolor tempor elit voluptate voluptate incididunt laborum. Laboris cupidatat velit in aliqua do.\r\n","registered":"2014-09-28T10:44:50 +07:00","latitude":58.886759,"longitude":-121.080578,"tags":["dolor","in","mollit","labore","duis","ea","non"],"friends":[{"id":0,"name":"Amy Owens"},{"id":1,"name":"Mcguire Rose"},{"id":2,"name":"Roberts Gonzales"}],"greeting":"Hello, Lopez Phelps! You have 6 unread messages.","favoriteFruit":"apple"},{"_id":"57586b1ecd70f275dd4f6ced","index":2,"guid":"559f157d-6c7d-4321-bf6c-5e069309ffdc","isActive":false,"balance":"$3,285.51","picture":"http://placehold.it/32x32","age":30,"eyeColor":"green","name":"Natasha Hickman","gender":"female","company":"ZERBINA","email":"natashahickman@zerbina.com","phone":"+1 (996) 487-3507","address":"344 Surf Avenue, Gardners, New Hampshire, 7561","about":"Ex id incididunt est consequat irure. Fugiat magna duis ut occaecat. Sit incididunt et nisi occaecat incididunt ea. Magna aliqua anim aliqua anim excepteur in officia aliquip labore ex. Mollit minim incididunt cillum cillum duis in fugiat cillum duis officia Lorem. Culpa consectetur sint ullamco magna deserunt ut ipsum velit Lorem. Consectetur anim eiusmod ipsum eiusmod sit exercitation sit tempor incididunt proident sit.\r\n","registered":"2015-09-08T01:00:52 +07:00","latitude":-41.388774,"longitude":-125.41587,"tags":["dolor","minim","ullamco","incididunt","sint","nisi","aute"],"friends":[{"id":0,"name":"Weber Wade"},{"id":1,"name":"Hunt Delacruz"},{"id":2,"name":"Terra Little"}],"greeting":"Hello, Natasha Hickman! You have 3 unread messages.","favoriteFruit":"apple"}], function(opts){
      async1 = opts;
      done();
    });
  }

  beforeEach(function (done) {
      testSend(done);
  });

  it("should translate the array into key/value pairs", function () {
    expect(async1.channelName).toEqual('Form');
    expect(async1.dataMsg).toEqual('0._id=57586b1e1ab582f01179cf46&0.index=0&0.guid=fbc0c1fc-3124-42fc-9139-c8688a678c00&0.isActive=false&0.balance=%241%2C249.57&0.picture=http%3A%2F%2Fplacehold.it%2F32x32&0.age=28&0.eyeColor=blue&0.name=Daphne%20Levy&0.gender=female&0.company=OMNIGOG&0.email=daphnelevy%40omnigog.com&0.phone=%2B1%20(953)%20459-2087&0.address=544%20Tilden%20Avenue%2C%20Nipinnawasee%2C%20Maine%2C%204806&0.about=Irure%20mollit%20nulla%20nostrud%20irure%20excepteur%20aliqua.%20Anim%20esse%20eu%20ipsum%20nulla%20eu%20esse%20enim%20ipsum%20consequat%20incididunt.%20Aliqua%20sunt%20Lorem%20do%20est%20aute%20enim.%0D%0A&0.registered=2014-06-27T10%3A17%3A24%20%2B07%3A00&0.latitude=10.164059&0.longitude=62.296736&0.tags_len=7&0.tags_json=%5B%22magna%22%2C%22amet%22%2C%22non%22%2C%22reprehenderit%22%2C%22exercitation%22%2C%22nostrud%22%2C%22qui%22%5D&0.tags=qui&0.tags=nostrud&0.tags=exercitation&0.tags=reprehenderit&0.tags=non&0.tags=amet&0.tags=magna&0.friends_len=3&0.friends_json=%5B%7B%22id%22%3A0%2C%22name%22%3A%22Golden%20Mckay%22%7D%2C%7B%22id%22%3A1%2C%22name%22%3A%22Mullins%20Baldwin%22%7D%2C%7B%22id%22%3A2%2C%22name%22%3A%22Knight%20Tran%22%7D%5D&0.friends.id=2&0.friends.name=Knight%20Tran&0.friends.id=1&0.friends.name=Mullins%20Baldwin&0.friends.id=0&0.friends.name=Golden%20Mckay&0.greeting=Hello%2C%20Daphne%20Levy!%20You%20have%2010%20unread%20messages.&0.favoriteFruit=apple&1._id=57586b1e78b157455a47772e&1.index=1&1.guid=719fe570-2c83-4e2c-83e1-9aa0d7e60aa7&1.isActive=false&1.balance=%242%2C394.87&1.picture=http%3A%2F%2Fplacehold.it%2F32x32&1.age=34&1.eyeColor=green&1.name=Lopez%20Phelps&1.gender=male&1.company=ACRUEX&1.email=lopezphelps%40acruex.com&1.phone=%2B1%20(962)%20540-3722&1.address=971%20Pitkin%20Avenue%2C%20Selma%2C%20Massachusetts%2C%20188&1.about=Laborum%20magna%20ex%20pariatur%20esse%20aliqua.%20Aliqua%20commodo%20est%20enim%20nostrud%20in%20dolor%20tempor%20elit%20voluptate%20voluptate%20incididunt%20laborum.%20Laboris%20cupidatat%20velit%20in%20aliqua%20do.%0D%0A&1.registered=2014-09-28T10%3A44%3A50%20%2B07%3A00&1.latitude=58.886759&1.longitude=-121.080578&1.tags_len=7&1.tags_json=%5B%22dolor%22%2C%22in%22%2C%22mollit%22%2C%22labore%22%2C%22duis%22%2C%22ea%22%2C%22non%22%5D&1.tags=non&1.tags=ea&1.tags=duis&1.tags=labore&1.tags=mollit&1.tags=in&1.tags=dolor&1.friends_len=3&1.friends_json=%5B%7B%22id%22%3A0%2C%22name%22%3A%22Amy%20Owens%22%7D%2C%7B%22id%22%3A1%2C%22name%22%3A%22Mcguire%20Rose%22%7D%2C%7B%22id%22%3A2%2C%22name%22%3A%22Roberts%20Gonzales%22%7D%5D&1.friends.id=2&1.friends.name=Roberts%20Gonzales&1.friends.id=1&1.friends.name=Mcguire%20Rose&1.friends.id=0&1.friends.name=Amy%20Owens&1.greeting=Hello%2C%20Lopez%20Phelps!%20You%20have%206%20unread%20messages.&1.favoriteFruit=apple&2._id=57586b1ecd70f275dd4f6ced&2.index=2&2.guid=559f157d-6c7d-4321-bf6c-5e069309ffdc&2.isActive=false&2.balance=%243%2C285.51&2.picture=http%3A%2F%2Fplacehold.it%2F32x32&2.age=30&2.eyeColor=green&2.name=Natasha%20Hickman&2.gender=female&2.company=ZERBINA&2.email=natashahickman%40zerbina.com&2.phone=%2B1%20(996)%20487-3507&2.address=344%20Surf%20Avenue%2C%20Gardners%2C%20New%20Hampshire%2C%207561&2.about=Ex%20id%20incididunt%20est%20consequat%20irure.%20Fugiat%20magna%20duis%20ut%20occaecat.%20Sit%20incididunt%20et%20nisi%20occaecat%20incididunt%20ea.%20Magna%20aliqua%20anim%20aliqua%20anim%20excepteur%20in%20officia%20aliquip%20labore%20ex.%20Mollit%20minim%20incididunt%20cillum%20cillum%20duis%20in%20fugiat%20cillum%20duis%20officia%20Lorem.%20Culpa%20consectetur%20sint%20ullamco%20magna%20deserunt%20ut%20ipsum%20velit%20Lorem.%20Consectetur%20anim%20eiusmod%20ipsum%20eiusmod%20sit%20exercitation%20sit%20tempor%20incididunt%20proident%20sit.%0D%0A&2.registered=2015-09-08T01%3A00%3A52%20%2B07%3A00&2.latitude=-41.388774&2.longitude=-125.41587&2.tags_len=7&2.tags_json=%5B%22dolor%22%2C%22minim%22%2C%22ullamco%22%2C%22incididunt%22%2C%22sint%22%2C%22nisi%22%2C%22aute%22%5D&2.tags=aute&2.tags=nisi&2.tags=sint&2.tags=incididunt&2.tags=ullamco&2.tags=minim&2.tags=dolor&2.friends_len=3&2.friends_json=%5B%7B%22id%22%3A0%2C%22name%22%3A%22Weber%20Wade%22%7D%2C%7B%22id%22%3A1%2C%22name%22%3A%22Hunt%20Delacruz%22%7D%2C%7B%22id%22%3A2%2C%22name%22%3A%22Terra%20Little%22%7D%5D&2.friends.id=2&2.friends.name=Terra%20Little&2.friends.id=1&2.friends.name=Hunt%20Delacruz&2.friends.id=0&2.friends.name=Weber%20Wade&2.greeting=Hello%2C%20Natasha%20Hickman!%20You%20have%203%20unread%20messages.&2.favoriteFruit=apple&_ts=' + async1.data._ts + '&_nmob=t&_device=desktop&url=localhost%3A9876%2Fcontext.html&_if=t&_uid=' + async1.data._uid + '&_getid=t&_v='+window.__karma__.config.ioversion+'&_ca=jstag1');
  });
});

describe("verify that we can block all sends and then flush the queue to handle state aware entity lookup", function() {
  var async1, count=0;

  function testSend(done) {
    jstag.send("streamname", {"test":"value1"}, function(opts){
      async1 = opts;
      count++;
      if(count >= 1){
        done();
      }
    });
  }

  beforeEach(function (done) {
      window.jstag.unblock();
      testSend(done);
  });

  it("should not fill up the queue when the block flag is set to false", function() {
    expect(window.jstag.config.blockload).toBe(false);
    expect(window.jstag.config.payloadQueue.length).toEqual(0);
    expect(async1.dataMsg).toEqual('test=value1&_ts=' + async1.data._ts + '&_nmob=t&_device=desktop&url=localhost%3A9876%2Fcontext.html&_if=t&_uid=' + async1.data._uid + '&_getid=t&_v='+window.__karma__.config.ioversion+'&_ca=jstag1');
  });
});

describe("verify that events fire after they have been added to queue by block", function() {
  var async1, async2, count=0;

  function testSend(done) {
    jstag.block();

    jstag.send("streamname", {"test":"value"}, function(opts){
      async1 = opts;
      count++;
      if(count >= 2){
        done();
      }
    });

    jstag.send("streamname", {"test2":"value2"}, function(opts){
      async2 = opts;
      count++;
      if(count >= 2){
        done();
      }
    });

    expect(jstag.config.blockload).toBe(true);
    expect(jstag.config.payloadQueue.length).toEqual(2);

    jstag.unblock();
  }

  beforeEach(function (done) {
    testSend(done);
  });

  it("should receive outbound query params for previously blocked sends", function() {
    expect(async1.dataMsg).toEqual('test=value&_ts=' + async1.data._ts + '&_nmob=t&_device=desktop&url=localhost%3A9876%2Fcontext.html&_if=t&_uid=' + async1.data._uid + '&_getid=t&_v='+window.__karma__.config.ioversion+'&_ca=jstag1');
    expect(async2.dataMsg).toEqual('test2=value2&_ts=' + async2.data._ts + '&_nmob=t&_device=desktop&url=localhost%3A9876%2Fcontext.html&_if=t&_uid=' + async2.data._uid + '&_getid=t&_v='+window.__karma__.config.ioversion+'&_ca=jstag1');
  });
});

describe("verify that all blocked events in the queue are added the the payload of the mock call", function() {
  var async1;

  function testSend(done) {
    jstag.block();

    jstag.send("streamname", {"test":"value1"});
    jstag.send("streamname", {"test2":"value2"});

    expect(jstag.config.blockload).toBe(true);
    expect(jstag.config.payloadQueue.length).toEqual(2);

    jstag.mock("streamname", {"test3":"value3"}, function(opts){
      async1 = opts;
      done();
    });
  }

  beforeEach(function (done) {
    testSend(done);
  });

  it("should merge the payload from the two blocked events and one mock event", function() {
    expect(async1.dataMsg).toEqual('test=value1&test2=value2&test3=value3&_ts=' + async1.data._ts + '&_nmob=t&_device=desktop&url=localhost%3A9876%2Fcontext.html&_if=t&_uid=' + async1.data._uid + '&_getid=t&_v='+window.__karma__.config.ioversion+'&_ca=jstag1');
  });
});

describe("verify that we can get and set necessary cookies", function() {
  it("should have core lytics cookies: seerses and seerid", function() {
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
        testb = {"one":"imheretostay", "two":"value1"},
        testc = {"two":"value2", "three":{"a":"a", "b":"b"}},
        resp = jstag.extend(testa, testb, testc);

    expect(resp.one).toEqual("imheretostay");
    expect(resp.two).toEqual("value2");
    expect(resp.three).toEqual({"a":"a", "b":"b"});

    // make sure we dont mutate
    expect(testa).toEqual({"one":"imgettingremoved", "two":2});
    expect(testb).toEqual({"one":"imheretostay", "two":"value1"});
    expect(testc).toEqual({"two":"value2", "three":{"a":"a", "b":"b"}});
  });
});