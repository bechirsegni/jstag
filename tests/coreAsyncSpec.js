// verify that the core async tag gets loaded and has the necessary functions defined
describe("async:core", function() {
  describe("async:initialization", function() {
    it("jstag should exist but should not be loaded", function() {
      // validate
      expect(jstag).toBeDefined();
      expect(jstag.isLoaded).not.toBeDefined();
    });

    it("should have the proper functions defined", function(){
      expect(jstag.ready).toBeDefined();
      expect(jstag.bind).toBeDefined();
      expect(jstag.send).toBeDefined();
      expect(jstag.mock).toBeDefined();
      expect(jstag.identify).toBeDefined();
      expect(jstag.pageView).toBeDefined();
      expect(jstag.block).toBeDefined();
      expect(jstag.unblock).toBeDefined();
    });
  });

  // verify that the config is loaded, populated and events fired before io loads are stored
  describe("async:pre-initialization queue", function() {
    it("queue should capture events and store them", function() {
      // attempt some sends
      jstag.send({"sample1":true});
      jstag.send({"sample2":true});

      // validate
      expect(jstag._q.length).toBe(2);
      expect(jstag._q[0][2][0].sample1).toBe(true);
      expect(jstag._c.cid).toBe('{{account.id}}');
      expect(jstag._c.url).toBe('//c.lytics.io');
    });
  });
});
