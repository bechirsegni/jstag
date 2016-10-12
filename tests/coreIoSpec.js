/* global jstag2, __lytics__jstag__, jasmineMatchers, getURL, getIoVersion, getTimezone, getNavigatorLanguage, map, mapBy */
describe("io:core", function() {
  var jstag = __lytics__jstag__;
  var parseQueryString = jstag.util.parseQueryString;

  beforeEach(function() {
    jasmine.addMatchers(jasmineMatchers);
  });

  beforeEach(function() {
    jstag.init({
      cid: 'dummycid',
      url: '//localhost:3001',
      min: true,
      loadid: false
    });
  });

  describe("verify that the core async tag gets loaded and has the necessary functions defined", function() {
    it("jstag should exist but should not be loaded", function() {
      expect(jstag).toBeDefined();
    });

    it("should have the proper functions defined", function() {
      expect(jstag.init).toBeDefined();
      expect(jstag.bind).toBeDefined();
      expect(jstag.send).toBeDefined();
      expect(jstag.identify).toBeDefined();
      expect(jstag.mock).toBeDefined();
      expect(jstag.page).toBeDefined();
      expect(jstag.pageView).toBeDefined();
      expect(jstag.parseEvent).toBeDefined();
    });
  });

  describe("ensure the parse event function can handle all the send/mock payload possibilities", function() {
    var resp, cb, obj;
    cb = function() {};
    obj = { "test":"one" };

    describe("payload generation", function() {
      describe("invalid calls", function() {
        it("handles no strea and no data", function() {
          resp = jstag.parseEvent();
          expect(resp).toEqual({ data: {}, callback: undefined, stream: undefined });
        });

        it("handles just a stream and no data", function() {
          expect(jstag.parseEvent("fakestream")).toEqual({ data: {}, callback: undefined, stream: "fakestream" });
        });

        it("handles just a callback and no data", function() {
          resp = jstag.parseEvent(cb);
          expect(resp).toEqual({ data: {}, callback: cb, stream: undefined });
        });
      });

      describe("valid calls", function() {
        it("handles just data", function() {
          resp = jstag.parseEvent(obj);
          expect(resp).toEqual({ data: obj, callback: undefined, stream: undefined });
        });

        it("handles a stream and data", function() {
          resp = jstag.parseEvent("mystream", obj);
          expect(resp).toEqual({ data: obj, callback: undefined, stream: "mystream" });
        });

        it("handles data and a callback", function() {
          resp = jstag.parseEvent(obj, cb);
          expect(resp).toEqual({ data: obj, callback: cb, stream: undefined });
        });

        it("handles a stream and a callback", function() {
          resp = jstag.parseEvent("mystream", obj, cb);
          expect(resp).toEqual({ data: obj, callback: cb, stream: "mystream" });
        });

        it("handles mock and a callback", function() {
          resp = jstag.parseEvent(obj, cb);
          expect(resp).toEqual({ data: obj, callback: cb, stream: undefined });
        });

        it("handles data, mock and a callback", function() {
          resp = jstag.parseEvent("mystream", obj, cb);
          expect(resp).toEqual({ data: obj, callback: cb, stream: "mystream" });
        });

        it("handles data, stream, mock and a callback", function() {
          resp = jstag.parseEvent(obj, "mystream", cb);
          expect(resp).toEqual({ data: obj, callback: cb, stream: "mystream" });
        });
      });
    });
  });

  describe("the jstag.send and jstag.mock(wrapper) methods", function() {
    var async1, async2, async3, async4;
    var count = 0;

    function testSend(done) {
      jstag.pageView("teststream", { "one":"value1" }, function(opts) {
        async1 = opts;
        count++;
        if (count >= 4) {
          done();
        }
      });

      jstag.send("teststream", { "two":"value2" }, function(opts) {
        async2 = opts;
        count++;
        if (count >= 4) {
          done();
        }
      });

      jstag.mock("teststream", { "three":"value3" }, function(opts) {
        async3 = opts;
        count++;
        if (count >= 4) {
          done();
        }
      });

      jstag.mock("teststream", { "four":"value4" }, function(opts) {
        async4 = opts;
        count++;
        if (count >= 4) {
          done();
        }
      });
    }

    beforeEach(function(done) {
      testSend(done);
    });

    it("should send four calls with correct data as payload", function() {
      // first send should not include uid, but does include sesstart
      var dataMsg1 = parseQueryString(async1.dataMsg);

      expect(dataMsg1.one).toEqual('value1');
      expect(dataMsg1._ts).toEqualString(async1.data._ts);
      expect(dataMsg1._nmob).toEqual('t');
      expect(dataMsg1._device).toEqual('desktop');
      expect(dataMsg1.url).toEqual(getURL());
      expect(dataMsg1._v).toEqual(getIoVersion());
      expect(dataMsg1._e).toEqual('pv');
      expect(dataMsg1._sesstart).toEqual('1');
      expect(dataMsg1._tz).toEqualString(getTimezone());
      expect(dataMsg1._ul).toEqual(getNavigatorLanguage());
      expect(dataMsg1._sz).toMatch(/\d+x\d+/);
      expect(dataMsg1._uid).toEqual(async1.data._uid);
      expect(dataMsg1._getid).toEqual('t');

      // future sends should not include session but do include new _uid
      var dataMsg2 = parseQueryString(async2.dataMsg);

      expect(dataMsg2.two).toEqual('value2');
      expect(dataMsg2._ts).toEqualString(async2.data._ts);
      expect(dataMsg2._nmob).toEqual('t');
      expect(dataMsg2._device).toEqual('desktop');
      expect(dataMsg2.url).toEqual(getURL());
      expect(dataMsg2._v).toEqual(getIoVersion());
      expect(dataMsg2._e).toBeUndefined();
      expect(dataMsg2._sesstart).toBeUndefined();
      expect(dataMsg2._tz).toBeUndefined();
      expect(dataMsg2._ul).toBeUndefined();
      expect(dataMsg2._sz).toBeUndefined();
      expect(dataMsg2._uid).toEqual(async2.data._uid);
      expect(dataMsg2._getid).toEqual('t');

      var dataMsg3 = parseQueryString(async3.dataMsg);

      expect(dataMsg3.three).toEqual('value3');
      expect(dataMsg3._ts).toEqualString(async3.data._ts);
      expect(dataMsg3._nmob).toEqual('t');
      expect(dataMsg3._device).toEqual('desktop');
      expect(dataMsg3.url).toEqual(getURL());
      expect(dataMsg3._v).toEqual(getIoVersion());
      expect(dataMsg3._e).toEqual('mk');
      expect(dataMsg3._sesstart).toEqual('1');
      expect(dataMsg3._tz).toEqualString(getTimezone());
      expect(dataMsg3._ul).toEqual(getNavigatorLanguage());
      expect(dataMsg3._sz).toMatch(/\d+x\d+/);
      expect(dataMsg3._uid).toEqual(async3.data._uid);
      expect(dataMsg3._getid).toEqual('t');
      expect(dataMsg3._uid).toEqual(async3.data._uid);
      expect(dataMsg3._getid).toEqual('t');

      var dataMsg4 = parseQueryString(async4.dataMsg);

      expect(dataMsg4.four).toEqual('value4');
      expect(dataMsg4._ts).toEqualString(async4.data._ts);
      expect(dataMsg4._nmob).toEqual('t');
      expect(dataMsg4._device).toEqual('desktop');
      expect(dataMsg4.url).toEqual(getURL());
      expect(dataMsg4._v).toEqual(getIoVersion());
      expect(dataMsg4._e).toEqual('mk');
      expect(dataMsg4._sesstart).toEqual('1');
      expect(dataMsg4._tz).toEqualString(getTimezone());
      expect(dataMsg4._ul).toEqual(getNavigatorLanguage());
      expect(dataMsg4._sz).toMatch(/\d+x\d+/);
      expect(dataMsg4._uid).toEqual(async4.data._uid);
      expect(dataMsg4._getid).toEqual('t');
      expect(dataMsg4._uid).toEqual(async4.data._uid);
      expect(dataMsg4._getid).toEqual('t');
    });
  });

  describe("when send is called without arguments", function() {
    it("should not throw an error", function() {
      expect(function() {
        jstag.send();
      }).not.toThrow();
    });
  });

  describe("when sending an array, instead of an object", function() {
    var async1;

    function testSend(done) {
      jstag.send("teststream", [ { "one":"value1" }, { "two":"value2" } ], function(opts) {
        async1 = opts;
        done();
      });
    }

    beforeEach(function(done) {
      testSend(done);
    });

    it("should translate the array into key/value pairs", function() {
      var dataMsg1 = parseQueryString(async1.dataMsg);

      expect(dataMsg1['0.one']).toEqual("value1");
      expect(dataMsg1['1.two']).toEqual("value2");
      expect(dataMsg1._ts).toEqualString(async1.data._ts);
      expect(dataMsg1._nmob).toEqual('t');
      expect(dataMsg1._device).toEqual('desktop');
      expect(dataMsg1.url).toEqual(getURL());
      expect(dataMsg1._if).toEqual('t');
      expect(dataMsg1._uid).toEqualString(async1.data._uid);
      expect(dataMsg1._getid).toEqual('t');
      expect(dataMsg1._v).toEqual(getIoVersion());
    });
  });

  describe("when sending an object with methods", function() {
    var async1;

    beforeEach(function(done) {
      jstag.send({
        imaMethod: function() { return 3; },
        iReturnAFunction: function() { return function() {}; }
      }, function(opts) {
        async1 = opts;
        done();
      });
    });

    it("should not serialize function values returned by the methods", function() {
      var dataMsg1 = parseQueryString(async1.dataMsg);

      expect(dataMsg1.imaMethod).toBeUndefined();
      expect(dataMsg1.iReturnAFunction).toBeUndefined();
    });
  });

  describe("when attempting to send a number", function() {
    it("should throw an error", function() {
      expect(function() {
        jstag.send(1);
      }).toThrow(new TypeError('unable to process jstag.send event: unknown value type (number)'));
    });
  });

  describe("when the location URI has query params", function() {
    describe("when `qsargs` are not specified", function() {
      it("should include only `utm_`-prefixed query params", function() {
        var async1;

        beforeEach(function(done) {
          jstag.init(jstag.extend({}, jstag.config, {
            location: location.href + '?foo=42&bar=yolo&utm_blah=t'
          }));
          jstag.pageView(function(opts) {
            async1 = opts;
            done();
          });
        });

        it("should include `utm_`-prefixed and whitelisted query params", function() {
          var dataMsg1 = parseQueryString(async1.dataMsg);

          expect(dataMsg1.utm_blah).toBe('t');
          expect(dataMsg1.foo).toBeUndefined();
          expect(dataMsg1.bar).toBeUndefined();
        });
      });
    });

    describe("when `qsargs` are specified", function() {
      var async1;

      beforeEach(function(done) {
        jstag.init(jstag.extend({}, jstag.config, {
          location: location.href + '?foo=42&bar=yolo&utm_blah=t',
          qsargs: [ 'foo' ]
        }));
        jstag.pageView(function(opts) {
          async1 = opts;
          done();
        });
      });

      it("should include `utm_`-prefixed and whitelisted query params", function() {
        var dataMsg1 = parseQueryString(async1.dataMsg);

        expect(dataMsg1.utm_blah).toBe('t');
        expect(dataMsg1.foo).toBe('42');
        expect(dataMsg1.bar).toBeUndefined();
      });
    });
  });

  describe("when processing a `pageView` event", function() {
    var async1;

    function testPageView(done) {
      jstag.pageView("teststream", function(opts) {
        async1 = opts;
        done();
      });
    }

    beforeEach(function(done) {
      testPageView(done);
    });

    it("should add and/or alter the _e param and start session", function() {
      var dataMsg1 = parseQueryString(async1.dataMsg);

      expect(dataMsg1._e).toEqual('pv');
      expect(dataMsg1._sesstart).toEqual('1');
      expect(dataMsg1._tz).toEqualString(getTimezone());
      expect(dataMsg1._ul).toEqual(getNavigatorLanguage());
      expect(dataMsg1._sz).toMatch(/\d+x\d+/);
      expect(dataMsg1._ts).toEqualString(async1.data._ts);
      expect(dataMsg1._nmob).toEqual('t');
      expect(dataMsg1._device).toEqual('desktop');
      expect(dataMsg1.url).toEqual(getURL());
      expect(dataMsg1._if).toEqual('t');
      expect(dataMsg1._uid).toEqual(async1.data._uid);
      expect(dataMsg1._getid).toEqual('t');
      expect(dataMsg1._v).toEqual(getIoVersion());
    });
  });

  // TODO: is this something we actually want to support?
  describe("when sending `_uid`", function() {
    var async1;

    describe("when `_uid` is truthy", function() {
      beforeEach(function(done) {
        jstag.send({ _uid: 711 }, function(opts) {
          async1 = opts;
          done();
        });
      });

      it("should use the user-provided `_uid`", function() {
        var dataMsg1 = parseQueryString(async1.dataMsg);

        expect(dataMsg1._uid).toBe('711');
      });
    });

    describe("when `_uid` is falsey", function() {
      beforeEach(function(done) {
        jstag.send({ _uid: null }, function(opts) {
          async1 = opts;
          done();
        });
      });

      it("should not use the user-provided `_uid`", function() {
        var dataMsg1 = parseQueryString(async1.dataMsg);

        expect(dataMsg1._uid).toBeDefined();
        expect(dataMsg1._uid).not.toBe('null');
      });
    });
  });

  describe("verify that we can properly process an identify event", function() {
    var async1;
    var count = 0;

    function testIdentify(done) {
      jstag.identify("myfakeuserid", function(opts) {
        async1 = opts;
        count++;
        if (count >= 1) {
          done();
        }
      });
    }

    beforeEach(function(done) {
      testIdentify(done);
    });

    it("should add the user_id param to identify the user", function() {
      expect(async1.channelName).toEqual('Gif');

      var dataMsg1 = parseQueryString(async1.dataMsg);

      expect(dataMsg1._ts).toEqualString(async1.data._ts);
      expect(dataMsg1._nmob).toEqual('t');
      expect(dataMsg1._device).toEqual('desktop');
      expect(dataMsg1.url).toEqual(getURL());
      expect(dataMsg1._if).toEqual('t');
      expect(dataMsg1._uid).toEqual(async1.data._uid);
      expect(dataMsg1._getid).toEqual('t');
      expect(dataMsg1._v).toEqual(getIoVersion());
    });
  });

  describe("verify that we can process data using the alternative form method and that if default to form after 2k characters", function() {
    var async1;

    function testSend(done) {
      jstag.send("teststream", [ { "_id":"57586b1e1ab582f01179cf46", "index":0, "guid":"fbc0c1fc-3124-42fc-9139-c8688a678c00", "isActive":false, "balance":"$1,249.57", "picture":"http://placehold.it/32x32", "age":28, "eyeColor":"blue", "name":"Daphne Levy", "gender":"female", "company":"OMNIGOG", "email":"daphnelevy@omnigog.com", "phone":"+1 (953) 459-2087", "address":"544 Tilden Avenue, Nipinnawasee, Maine, 4806", "about":"Irure mollit nulla nostrud irure excepteur aliqua. Anim esse eu ipsum nulla eu esse enim ipsum consequat incididunt. Aliqua sunt Lorem do est aute enim.\r\n", "registered":"2014-06-27T10:17:24 +07:00", "latitude":10.164059, "longitude":62.296736, "tags":[ "magna", "amet", "non", "reprehenderit", "exercitation", "nostrud", "qui" ], "friends":[ { "id":0, "name":"Golden Mckay" }, { "id":1, "name":"Mullins Baldwin" }, { "id":2, "name":"Knight Tran" } ], "greeting":"Hello, Daphne Levy! You have 10 unread messages.", "favoriteFruit":"apple" }, { "_id":"57586b1e78b157455a47772e", "index":1, "guid":"719fe570-2c83-4e2c-83e1-9aa0d7e60aa7", "isActive":false, "balance":"$2,394.87", "picture":"http://placehold.it/32x32", "age":34, "eyeColor":"green", "name":"Lopez Phelps", "gender":"male", "company":"ACRUEX", "email":"lopezphelps@acruex.com", "phone":"+1 (962) 540-3722", "address":"971 Pitkin Avenue, Selma, Massachusetts, 188", "about":"Laborum magna ex pariatur esse aliqua. Aliqua commodo est enim nostrud in dolor tempor elit voluptate voluptate incididunt laborum. Laboris cupidatat velit in aliqua do.\r\n", "registered":"2014-09-28T10:44:50 +07:00", "latitude":58.886759, "longitude":-121.080578, "tags":[ "dolor", "in", "mollit", "labore", "duis", "ea", "non" ], "friends":[ { "id":0, "name":"Amy Owens" }, { "id":1, "name":"Mcguire Rose" }, { "id":2, "name":"Roberts Gonzales" } ], "greeting":"Hello, Lopez Phelps! You have 6 unread messages.", "favoriteFruit":"apple" }, { "_id":"57586b1ecd70f275dd4f6ced", "index":2, "guid":"559f157d-6c7d-4321-bf6c-5e069309ffdc", "isActive":false, "balance":"$3,285.51", "picture":"http://placehold.it/32x32", "age":30, "eyeColor":"green", "name":"Natasha Hickman", "gender":"female", "company":"ZERBINA", "email":"natashahickman@zerbina.com", "phone":"+1 (996) 487-3507", "address":"344 Surf Avenue, Gardners, New Hampshire, 7561", "about":"Ex id incididunt est consequat irure. Fugiat magna duis ut occaecat. Sit incididunt et nisi occaecat incididunt ea. Magna aliqua anim aliqua anim excepteur in officia aliquip labore ex. Mollit minim incididunt cillum cillum duis in fugiat cillum duis officia Lorem. Culpa consectetur sint ullamco magna deserunt ut ipsum velit Lorem. Consectetur anim eiusmod ipsum eiusmod sit exercitation sit tempor incididunt proident sit.\r\n", "registered":"2015-09-08T01:00:52 +07:00", "latitude":-41.388774, "longitude":-125.41587, "tags":[ "dolor", "minim", "ullamco", "incididunt", "sint", "nisi", "aute" ], "friends":[ { "id":0, "name":"Weber Wade" }, { "id":1, "name":"Hunt Delacruz" }, { "id":2, "name":"Terra Little" } ], "greeting":"Hello, Natasha Hickman! You have 3 unread messages.", "favoriteFruit":"apple" } ], function(opts) {
        async1 = opts;
        done();
      });
    }

    beforeEach(function(done) {
      testSend(done);
    });

    it("should translate the array into key/value pairs", function() {
      expect(async1.dataMsg.length).toBeGreaterThan(2000);
      expect(async1.channelName).toEqual('Form');

      var dataMsg1 = parseQueryString(async1.dataMsg);

      expect(dataMsg1['0._id']).toEqual(async1.data[0]._id);
      expect(dataMsg1['0.index']).toEqualString(async1.data[0].index);
      expect(dataMsg1['0.guid']).toEqual(async1.data[0].guid);
      expect(dataMsg1['0.isActive']).toEqualString(async1.data[0].isActive);
      expect(dataMsg1['0.balance']).toEqual(async1.data[0].balance);
      expect(dataMsg1['0.picture']).toEqual(async1.data[0].picture);
      expect(dataMsg1['0.age']).toEqualString(async1.data[0].age);
      expect(dataMsg1['0.eyeColor']).toEqual(async1.data[0].eyeColor);
      expect(dataMsg1['0.name']).toEqual(async1.data[0].name);
      expect(dataMsg1['0.gender']).toEqual(async1.data[0].gender);
      expect(dataMsg1['0.company']).toEqual(async1.data[0].company);
      expect(dataMsg1['0.email']).toEqual(async1.data[0].email);
      expect(dataMsg1['0.phone']).toEqual(async1.data[0].phone);
      expect(dataMsg1['0.address']).toEqual(async1.data[0].address);
      expect(dataMsg1['0.about']).toEqual(async1.data[0].about);
      expect(dataMsg1['0.registered']).toEqual(async1.data[0].registered);
      expect(dataMsg1['0.latitude']).toEqualString(async1.data[0].latitude);
      expect(dataMsg1['0.longitude']).toEqualString(async1.data[0].longitude);
      expect(dataMsg1['0.tags_len']).toEqualString(async1.data[0].tags.length);
      expect(dataMsg1['0.tags_json']).toEqual(JSON.stringify(async1.data[0].tags));
      expect(dataMsg1['0.tags']).toEqualUnordered(async1.data[0].tags);
      expect(dataMsg1['0.friends_len']).toEqualString(async1.data[0].friends.length);
      expect(dataMsg1['0.friends_json']).toEqual(JSON.stringify(async1.data[0].friends));
      expect(dataMsg1['0.friends.id']).toEqualUnordered(map(mapBy(async1.data[0].friends, 'id'), String));
      expect(dataMsg1['0.friends.name']).toEqualUnordered(map(mapBy(async1.data[0].friends, 'name'), String));
      expect(dataMsg1['0.greeting']).toEqual(async1.data[0].greeting);
      expect(dataMsg1['0.favoriteFruit']).toEqual(async1.data[0].favoriteFruit);

      expect(dataMsg1['1._id']).toEqual(async1.data[1]._id);
      expect(dataMsg1['1.index']).toEqualString(async1.data[1].index);
      expect(dataMsg1['1.guid']).toEqual(async1.data[1].guid);
      expect(dataMsg1['1.isActive']).toEqualString(async1.data[1].isActive);
      expect(dataMsg1['1.balance']).toEqual(async1.data[1].balance);
      expect(dataMsg1['1.picture']).toEqual(async1.data[1].picture);
      expect(dataMsg1['1.age']).toEqualString(async1.data[1].age);
      expect(dataMsg1['1.eyeColor']).toEqual(async1.data[1].eyeColor);
      expect(dataMsg1['1.name']).toEqual(async1.data[1].name);
      expect(dataMsg1['1.gender']).toEqual(async1.data[1].gender);
      expect(dataMsg1['1.company']).toEqual(async1.data[1].company);
      expect(dataMsg1['1.email']).toEqual(async1.data[1].email);
      expect(dataMsg1['1.phone']).toEqual(async1.data[1].phone);
      expect(dataMsg1['1.address']).toEqual(async1.data[1].address);
      expect(dataMsg1['1.about']).toEqual(async1.data[1].about);
      expect(dataMsg1['1.registered']).toEqual(async1.data[1].registered);
      expect(dataMsg1['1.latitude']).toEqualString(async1.data[1].latitude);
      expect(dataMsg1['1.longitude']).toEqualString(async1.data[1].longitude);
      expect(dataMsg1['1.tags_len']).toEqualString(async1.data[1].tags.length);
      expect(dataMsg1['1.tags_json']).toEqual(JSON.stringify(async1.data[1].tags));
      expect(dataMsg1['1.tags']).toEqualUnordered(async1.data[1].tags);
      expect(dataMsg1['1.friends_len']).toEqualString(async1.data[1].friends.length);
      expect(dataMsg1['1.friends_json']).toEqual(JSON.stringify(async1.data[1].friends));
      expect(dataMsg1['1.friends.id']).toEqualUnordered(map(mapBy(async1.data[1].friends, 'id'), String));
      expect(dataMsg1['1.friends.name']).toEqualUnordered(map(mapBy(async1.data[1].friends, 'name'), String));
      expect(dataMsg1['1.greeting']).toEqual(async1.data[1].greeting);
      expect(dataMsg1['1.favoriteFruit']).toEqual(async1.data[1].favoriteFruit);
    });
  });

  describe("verify that we can block all sends and then flush the queue to handle state aware entity lookup", function() {
    var async1;
    var count = 0;

    function testSend(done) {
      jstag.send("streamname", { "test":"value1" }, function(opts) {
        async1 = opts;
        count++;
        if (count >= 1) {
          done();
        }
      });
    }

    beforeEach(function(done) {
      jstag.unblock();
      testSend(done);
    });

    it("should not fill up the queue when the block flag is set to false", function() {
      expect(jstag.config.blockload).toBe(false);
      expect(jstag.config.payloadQueue.length).toEqual(0);

      var dataMsg1 = parseQueryString(async1.dataMsg);

      expect(dataMsg1.test).toEqual(async1.data.test);
      expect(dataMsg1._ts).toEqualString(async1.data._ts);
      expect(dataMsg1._nmob).toEqual(async1.data._nmob);
      expect(dataMsg1._device).toEqual(async1.data._device);
      expect(dataMsg1.url).toEqual(getURL());
      expect(dataMsg1._if).toEqual(async1.data._if);
      expect(dataMsg1._uid).toEqual(async1.data._uid);
      expect(dataMsg1._getid).toEqual(async1.data._getid);
      expect(dataMsg1._v).toEqual(getIoVersion());
    });
  });

  describe("verify that events fire after they have been added to queue by block", function() {
    var async1, async2;
    var count = 0;

    function testSend(done) {
      jstag.block();

      jstag.send("streamname", { "test":"value" }, function(opts) {
        async1 = opts;
        count++;
        if (count >= 2) {
          done();
        }
      });

      jstag.send("streamname", { "test2":"value2" }, function(opts) {
        async2 = opts;
        count++;
        if (count >= 2) {
          done();
        }
      });

      expect(jstag.config.blockload).toBe(true);
      expect(jstag.config.payloadQueue.length).toEqual(2);

      jstag.unblock();
    }

    beforeEach(function(done) {
      testSend(done);
    });

    it("should receive outbound query params for previously blocked sends", function() {
      var dataMsg1 = parseQueryString(async1.dataMsg);

      expect(dataMsg1.test).toEqual('value');
      expect(dataMsg1._ts).toEqualString(async1.data._ts);
      expect(dataMsg1._nmob).toEqual('t');
      expect(dataMsg1._device).toEqual('desktop');
      expect(dataMsg1.url).toEqual(getURL());
      expect(dataMsg1._if).toEqual('t');
      expect(dataMsg1._uid).toEqual(async1.data._uid);
      expect(dataMsg1._getid).toEqual('t');
      expect(dataMsg1._v).toEqual(getIoVersion());

      var dataMsg2 = parseQueryString(async2.dataMsg);

      expect(dataMsg2.test2).toEqual('value2');
      expect(dataMsg2._ts).toEqualString(async2.data._ts);
      expect(dataMsg2._nmob).toEqual('t');
      expect(dataMsg2._device).toEqual('desktop');
      expect(dataMsg2.url).toEqual(getURL());
      expect(dataMsg2._if).toEqual('t');
      expect(dataMsg2._uid).toEqual(async2.data._uid);
      expect(dataMsg2._getid).toEqual('t');
      expect(dataMsg2._v).toEqual(getIoVersion());
    });
  });

  describe("verify that all blocked events in the queue are added the the payload of the mock call", function() {
    var async1;

    function testSend(done) {
      jstag.block();

      jstag.send("streamname", { "test":"value1" });
      jstag.send("streamname", { "test2":"value2" });

      expect(jstag.config.blockload).toBe(true);
      expect(jstag.config.payloadQueue.length).toEqual(2);

      jstag.mock("streamname", { "test3":"value3" }, function(opts) {
        async1 = opts;
        done();
      });
    }

    beforeEach(function(done) {
      testSend(done);
    });

    it("should merge the payload from the two blocked events and one mock event", function() {
      var dataMsg1 = parseQueryString(async1.dataMsg);

      expect(dataMsg1.test).toEqual('value1');
      expect(dataMsg1.test2).toEqual('value2');
      expect(dataMsg1.test3).toEqual('value3');
      expect(dataMsg1._ts).toEqualString(async1.data._ts);
      expect(dataMsg1._nmob).toEqual('t');
      expect(dataMsg1._device).toEqual('desktop');
      expect(dataMsg1.url).toEqual(getURL());
      expect(dataMsg1._if).toEqual('t');
      expect(dataMsg1._uid).toEqual(async1.data._uid);
      expect(dataMsg1._getid).toEqual('t');
      expect(dataMsg1._v).toEqual(getIoVersion());
    });
  });

  describe("verify that we can get and set necessary cookies", function() {
    xit("should have core lytics cookies: seerses and seerid", function() {
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
      var test = {};
      var resp = jstag.extend({}, test, { "one":1, "two":2 });

      expect(resp.one).toEqual(1);
      expect(resp.two).toEqual(2);

      // make sure we dont mutate
      expect(test).toEqual({});
    });

    it("should extend an existing object", function() {
      var test = { "one":"imgettingremoved", "three":3 };
      var resp = jstag.extend({}, test, { "one":1, "two":2 });

      expect(resp.one).toEqual(1);
      expect(resp.two).toEqual(2);
      expect(resp.three).toEqual(3);

      // make sure we dont mutate
      expect(test).toEqual({ "one":"imgettingremoved", "three":3 });
    });

    it("should accept multiple objects at once", function() {
      var testa = { "one":"imgettingremoved", "two":2 };
      var testb = { "one":"imheretostay", "two":"value1" };
      var testc = { "two":"value2", "three":{ "a":"a", "b":"b" } };
      var resp = jstag.extend({}, testa, testb, testc);

      expect(resp.one).toEqual("imheretostay");
      expect(resp.two).toEqual("value2");
      expect(resp.three).toEqual({ "a":"a", "b":"b" });

      // make sure we dont mutate
      expect(testa).toEqual({ "one":"imgettingremoved", "two":2 });
      expect(testb).toEqual({ "one":"imheretostay", "two":"value1" });
      expect(testc).toEqual({ "two":"value2", "three":{ "a":"a", "b":"b" } });
    });
  });

  describe("when the `seerid` cookie is already set", function() {
    var async1;

    beforeEach(function(done) {
      jstag.ckieSet('seerid', 'lmnop');
      jstag.send("streamname", { "test":"value1" }, function(opts) {
        async1 = opts;
        done();
      });
    });

    it("should not set the `_getid` field", function() {
      var dataMsg1 = parseQueryString(async1.dataMsg);

      expect(dataMsg1._getid).toBeUndefined();

      expect(dataMsg1.test).toEqual('value1');
      expect(dataMsg1._ts).toEqualString(async1.data._ts);
      expect(dataMsg1._nmob).toEqual('t');
      expect(dataMsg1._device).toEqual('desktop');
      expect(dataMsg1.url).toEqual(getURL());
      expect(dataMsg1._if).toEqual('t');
      expect(dataMsg1._uid).toEqual(async1.data._uid);
      expect(dataMsg1._v).toEqual(getIoVersion());
    });
  });

  describe("when the Google Analytics `__utma` cookie is already set", function() {
    var async1;

    beforeEach(function(done) {
      jstag.ckieSet('__utma', 'reallyLongStringWithA.DotInIt');
      jstag.send(function(opts) {
        async1 = opts;
        done();
      });
    });

    afterEach(function() {
      jstag.ckieDel('__utma');
    });

    it("should include an extracted bit of entropy `_ga` in the payload", function() {
      var dataMsg1 = parseQueryString(async1.dataMsg);

      expect(dataMsg1._ga).toBe('reallyLongStringWithA');
    });
  });

  describe("when the Optimizely `optimizelyEndUserId` is already set", function() {
    var async1;

    beforeEach(function(done) {
      jstag.ckieSet('optimizelyEndUserId', '12345');
      jstag.send(function(opts) {
        async1 = opts;
        done();
      });
    });

    afterEach(function() {
      jstag.ckieDel('optimizelyEndUserId');
    });

    it("should include the `optimizelyid` in the payload", function() {
      var dataMsg1 = parseQueryString(async1.dataMsg);

      expect(dataMsg1.optimizelyid).toBe('12345');
    });
  });

  // TODO: this MUST be reenabled
  describe("when the cookie is not called `seerid`", function() {
    var async1, oldCookieName;

    beforeEach(function(done) {
      oldCookieName = jstag.config.cookie;
      jstag.config.cookie = 'shakira';
      jstag.send(function(opts) {
        async1 = opts;
        done();
      });
    });

    afterEach(function() {
      jstag.config.cookie = oldCookieName;
    });

    it("should include the cookie name `_uidn` in the payload", function() {
      var urlQuery = parseQueryString(async1.sendurl[0].split('?')[1]);

      expect(urlQuery._uidn).toBe('shakira');
    });
  });

  describe("when the `url` and `cid` are not set", function() {
    var oldUrl, oldCid;

    beforeEach(function() {
      oldUrl = jstag.config.url;
      oldCid = jstag.config.cid;
      jstag.config.url = undefined;
      jstag.config.cid = undefined;
    });

    afterEach(function() {
      jstag.config.url = oldUrl;
      jstag.config.cid = oldCid;
    });

    it("should throw an error", function() {
      expect(function() {
        jstag.send();
      }).toThrow(new TypeError('Must have collection url and ProjectIds (cid)'));
    });
  });

  describe("the stream config parameter", function() {
    beforeEach(function() {
      jstag.init({
        url: '//c.lytics.io',
        cid: 'gazump',
        stream: 'combobulate',
        min: true,
        loadid: true
      });
    });

    it("is used as the default stream name when none is passed", function(done) {
      jstag.send(function(opts) {
        expect(opts.stream).toBe('combobulate');
        expect(opts.sendurl).toEqual([ '//c.lytics.io/c/gazump/combobulate' ]);
        done();
      });
    });

    it("can be overridden on a per-message basis", function(done) {
      jstag.send('mugwump', function(opts) {
        expect(opts.stream).toBe('mugwump');
        expect(opts.sendurl).toEqual([ '//c.lytics.io/c/gazump/mugwump' ]);
        done();
      });
    });
  });

  describe("when configured using a custom `loadid` option", function() {
    beforeEach(function() {
      jstag.init({
        cid: '{{account.id}}',
        url: '//c.lytics.io',
        min: true,
        loadid: true
      });
    });

    it("works", function() {

    });
  });
});
