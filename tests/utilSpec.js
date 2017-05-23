/* global __lytics__jstag__ */
describe("util", function() {
  var JSTag = __lytics__jstag__.JSTag;
  var instance;

  beforeEach(function() {
    instance = new JSTag();
    jasmine.addMatchers(jasmineMatchers);
  });

  describe("the extend method", function() {
    describe("shallow semantics", function() {
      it("should assign from right to left", function() {
        var source1 = { foo: 12 };
        var source2 = { foo: 14, bar: 13 };
        var target = instance.extend(source1, source2);

        expect(target.foo).toBe(14);
        expect(target.bar).toBe(13);
      });

      it("should mutate the existing object", function() {
        var source1 = { foo: 12 };
        var source2 = { foo: 14, bar: 13 };
        var target = instance.extend(source2, source1);

        expect(target.foo).toBe(12);
        expect(target.bar).toBe(13);
        expect(target).not.toBe(source1);
        expect(target).toBe(source2);
      });
    });

    describe("deep semantics", function() {
      it("should assign from right to left", function() {
        var source1 = { foo: { baz: 12, qux: 7 }, bar: { corge: 15, waldo: 7 } };
        var source2 = { foo: { qux: 2 }, bar: { corge: 7, waldo: 15 } };
        var target = instance.extend(true, source1, source2);

        expect(target.foo.baz).toBe(12);
        expect(target.foo.qux).toBe(2);
        expect(target.bar.corge).toBe(7);
        expect(target.bar.waldo).toBe(15);
      });

      it("should mutate the existing object", function() {
        var source1 = { foo: { baz: 12, qux: 7 }, bar: { corge: 15, waldo: 7 } };
        var source2 = { foo: { qux: 2 }, bar: { corge: 7, waldo: 15 } };
        var target = instance.extend(true, source2, source1);

        expect(target.foo.baz).toBe(12);
        expect(target.foo.qux).toBe(7);
        expect(target.bar.corge).toBe(15);
        expect(target.bar.waldo).toBe(7);
        expect(target).not.toBe(source1);
        expect(target).toBe(source2);
      });
    });
  });

  describe("the parseUri method", function() {
    it("should parse a URI", function() {
      var uri = 'http://example.com:3000/pathname/?search=test#hash';
      var parsed = instance.parseUri(uri);

      expect(parsed.protocol).toBe('http:');
      expect(parsed.hostname).toBe('example.com');
      expect(parsed.port).toBe('3000');
      expect(parsed.search).toBe('?search=test');
      expect(parsed.hash).toBe('#hash');
      expect(parsed.host).toBe('example.com:3000');

      // [compat 1] Note: We could potentially remove this assertion:
      expect(parsed.origin).toBe('http://example.com:3000');
    });
  });

  describe("the parseQueryString method", function() {
    it("should parse a query string", function() {
      var parsed = instance.parseQueryString('?search=test&search2=test2');

      expect(parsed.search).toBe('test');
      expect(parsed.search2).toBe('test2');
    });

    it("should parse query params with keys and no values", function() {
      var parsed = instance.parseQueryString("?foo&bar=12&baz");

      expect('foo' in parsed).toBe(true);
      expect(parsed.foo).toBe(null);
      expect(parsed.bar).toBe('12');
      expect('baz' in parsed).toBe(true);
      expect(parsed.baz).toBe(null);
    });

    it("should return an empty object when the input is the empty string", function() {
      var parsed = instance.parseQueryString('');

      expect(parsed).toEqual({});
    });

    it("should return an empty object when the input is not a string", function() {
      var foo = { prop: 12 };
      var parsed = instance.parseQueryString(foo);

      expect(parsed).toEqual({});
    });
  });

  describe("the getid method", function() {
    afterEach(function() {
      instance.deleteCookie('seerid');
    });

    describe("when unconfigured", function() {
      it("should call back asynchronously with a unique id using the built-in ID factory", function(done) {
        var called = false;

        instance.getid(function(id) {
          expect(id).toBeDefined();
          expect(id).toBeDefined();
          called = true;
          done();
        });

        expect(called).toBe(false);
      });
    });

    describe("when configured with loadid = true", function() {
      beforeEach(function() {
        instance = new JSTag({
          loadid: true,
          url: 'http://localhost:3002',
          idpath: '/cid/',
          cid: 'lala'
        });
      });

      it("should make a jsonp request to the specified endpoint", function(done) {
        instance.getid(function(id) {
          expect(id).toStartWith('dummy'); // "dummy" is hardcoded in the test server
          done();
        });
      });

      it("should only make one request to the getid endpoint", function(done) {
        var ids = [];

        for (var i = 0; i < 5; i++) {
          instance.getid(function(id) {
            if (ids.push(id) === 5) {
              expect(ids).toEqual([ ids[0], ids[0], ids[0], ids[0], ids[0] ]);
              done();
            }
          });
        }
      });
    });
  });

  describe("the cookies API", function() {
    describe("the setCookie method", function() {
      afterEach(function() {
        instance.deleteCookie('test');
      });

      it("should set a numeric cookie value", function() {
        expect(document.cookie).toBe('');
        instance.setCookie('test', 42);
        expect(document.cookie).toBe('test=42');
      });

      it("should set a string cookie value", function() {
        expect(document.cookie).toBe('');
        instance.setCookie('test', 'test');
        expect(document.cookie).toBe('test=test');
      });

      it("should set a boolean cookie value", function() {
        expect(document.cookie).toBe('');
        instance.setCookie('test', false);
        expect(document.cookie).toBe('test=false');
      });

      it("should set a null cookie value", function() {
        expect(document.cookie).toBe('');
        instance.setCookie('test', null);
        expect(document.cookie).toBe('test=null');
      });

      it("should set an object cookie value", function() {
        expect(document.cookie).toBe('');
        instance.setCookie('test', { foo: 42 });
        expect(document.cookie).toBe('test=%5Bobject%20Object%5D');
      });

      it("should set an array cookie value", function() {
        expect(document.cookie).toBe('');
        instance.setCookie('test', [ 5, 4, 3, 2, 1 ]);
        expect(document.cookie).toBe('test=5%2C4%2C3%2C2%2C1');
      });
    });

    describe("the getCookie method", function() {
      afterEach(function() {
        instance.deleteCookie('test');
      });

      it("should return undefined if the cookie doesn't exist", function() {
        expect(instance.getCookie('malarkey')).toBeNull();
      });

      it("should get a numeric cookie value", function() {
        expect(document.cookie).toBe('');
        instance.setCookie('test', 42);
        expect(instance.getCookie('test')).toBe('42');
      });

      it("should get a boolean cookie value", function() {
        expect(document.cookie).toBe('');
        instance.setCookie('test', false);
        expect(instance.getCookie('test')).toBe('false');
      });

      it("should get a string cookie value", function() {
        expect(document.cookie).toBe('');
        instance.setCookie('test', 'string');
        expect(instance.getCookie('test')).toBe('string');
      });

      it("should get a null cookie value", function() {
        expect(document.cookie).toBe('');
        instance.setCookie('test', null);
        expect(instance.getCookie('test')).toBe('null');
      });

      it("should get an object cookie value", function() {
        expect(document.cookie).toBe('');
        instance.setCookie('test', { foo: 42 });
        expect(instance.getCookie('test')).toEqual('[object Object]');
      });

      it("should get an array cookie value", function() {
        expect(document.cookie).toBe('');
        instance.setCookie('test', [ 5, 4, 3, 2, 1 ]);
        expect(instance.getCookie('test')).toEqual('5,4,3,2,1');
      });
    });

    describe("the deleteCookie method", function() {
      it("should delete a cookie", function() {
        expect(document.cookie).toBe('');
        instance.setCookie('test', 'test');
        expect(instance.getCookie('test')).toBe('test');
        instance.deleteCookie('test');
        expect(document.cookie).toBe('');
        expect(instance.getCookie('test')).toBeNull();
      });
    });
  });

  describe("the blocking API", function() {
    it("should not be blocked initially", function() {
      expect(instance.blocked).toBe(false);
    });

    describe("the unblock/block methods", function() {
      it("should block and unblock the instance from sending messages", function() {
        instance.block();
        expect(instance.blocked).toBe(true);
        instance.block();
        expect(instance.blocked).toBe(true);
        instance.unblock();
        expect(instance.blocked).toBe(false);
        instance.unblock();
        expect(instance.blocked).toBe(false);
        instance.block();
        expect(instance.blocked).toBe(true);
      });
    });

    describe("the block method", function() {
      describe("when the timeout is numeric", function() {
        it("should block for the time specified", function(done) {
          spyOn(instance, 'unblock');
          expect(instance.unblock).not.toHaveBeenCalled();
          instance.block(500);
          expect(instance.unblock).not.toHaveBeenCalled();
          setTimeout(function() {
            expect(instance.unblock).not.toHaveBeenCalled();
            setTimeout(function() {
              expect(instance.unblock).toHaveBeenCalled();
              done();
            }, 350);
          }, 250);
        });
      });

      describe("when the timeout is not numeric", function() {
        it("should default to 2000 ms when passed a string", function(done) {
          spyOn(instance, 'unblock');
          expect(instance.unblock).not.toHaveBeenCalled();
          instance.block('holy shit');
          expect(instance.unblock).not.toHaveBeenCalled();
          setTimeout(function() {
            expect(instance.unblock).toHaveBeenCalled();
            done();
          }, 2000);
        });

        it("should default to 2000 ms when passed NaN", function(done) {
          spyOn(instance, 'unblock');
          expect(instance.unblock).not.toHaveBeenCalled();
          instance.block(NaN);
          expect(instance.unblock).not.toHaveBeenCalled();
          setTimeout(function() {
            expect(instance.unblock).toHaveBeenCalled();
            done();
          }, 2000);
        });
      });
    });

    describe("when blocked", function() {
      it("should unblock the instance from sending messages");
    });
  });

  describe("event expandos", function() {
    it("has an abstract onIoReady method", function() {
      expect(typeof instance.onIoReady).toBe('function');
      expect(function() {
        instance.onIoReady();
      }).not.toThrow();
    });

    it("has an abstract onSendStarted method", function() {
      expect(typeof instance.onSendStarted).toBe('function');
      expect(function() {
        instance.onSendStarted();
      }).not.toThrow();
    });

    it("has an abstract onSendFinished method", function() {
      expect(typeof instance.onSendFinished).toBe('function');
      expect(function() {
        instance.onSendFinished();
      }).not.toThrow();
    });
  });
});
