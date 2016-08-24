/* global jstag */
describe("the event-emitter API", function() {
  var JSTag = jstag.JSTag;
  var instance;
  var event = 'io.ready'; // must be a valid event name.
  function listener() {}
  var options = {};

  beforeEach(function() {
    instance = new JSTag();
  });

  describe("the bind method", function() {
    it("should return the instance", function() {
      expect(instance.bind(event, listener)).toBe(instance);
    });
  });

  describe("the unbind method", function() {
    describe("when matching listeners are registered", function() {
      beforeEach(function() {
        instance.bind(event, listener);
      });

      it("should return the instance", function() {
        expect(instance.unbind(event, listener)).toBe(instance);
      });
    });

    describe("when no matching listeners are registered", function() {
      it("should return the instance", function() {
        expect(instance.unbind(event, listener)).toBe(instance);
      });
    });
  });

  describe("the bind/unbind methods", function() {
    it("should register/unregister listeners without options", function() {
      expect(instance.listeners[event]).toBeUndefined();
      instance.bind(event, listener);
      expect(instance.listeners[event][0]).toEqual([ listener, undefined ]);
      instance.unbind(event, listener);
      expect(instance.listeners[event]).toBeDefined();
      expect(instance.listeners[event].length).toBe(0);
    });

    it("should register/unregister listeners with options", function() {
      expect(instance.listeners[event]).toBeUndefined();
      instance.bind(event, listener, options);
      expect(instance.listeners[event][0]).toEqual([ listener, options ]);
      instance.unbind(event, listener, options);
      expect(instance.listeners[event]).toBeDefined();
      expect(instance.listeners[event].length).toBe(0);
    });

    it("should allow multiple lisnters to be registered for a single event", function() {
      expect(instance.listeners[event]).toBeUndefined();
      instance.bind(event, function() {});
      instance.bind(event, function() {});
      instance.bind(event, function() {});
      expect(instance.listeners[event].length).toBe(3);
    });

    describe("when no listener is passed", function() {
      it("should remove all listeners for the given event", function() {
        instance.bind(event, function() { throw 1; });
        instance.bind(event, function() { throw 2; });
        instance.bind(event, function() { throw 3; });
        expect(function() {
          instance.emit(event);
        }).toThrow();
        instance.unbind(event);
        expect(function() {
          instance.emit(event);
        }).not.toThrow();
      });
    });
  });

  describe("the emit method", function() {
    it("should invoke any listeners registered for a given event", function() {
      var called1 = false;
      var called2 = false;
      var called3 = false;

      instance.bind(event, function(a, b, c) {
        expect(a).toBe(1);
        expect(b).toBe(2);
        expect(c).toBe(3);
        called1 = true;
      });
      instance.bind(event, function() {
        called2 = true;
      });
      instance.bind(event, function() {
        called3 = true;
      });

      expect(called1).toBe(false);
      expect(called2).toBe(false);
      expect(called3).toBe(false);

      instance.emit(event, 1, 2, 3);

      expect(called1).toBe(true);
      expect(called2).toBe(true);
      expect(called3).toBe(true);
    });

    describe("when matching listeners are registered", function() {
      beforeEach(function() {
        instance.bind(event, listener);
      });

      it("should return the instance", function() {
        expect(instance.emit(event)).toBe(instance);
      });
    });

    describe("when no matching listeners are registered", function() {
      it("should return the instance", function() {
        expect(instance.emit(event)).toBe(instance);
      });
    });
  });
});
