// verify that the core async tag gets loaded and has the necessary functions defined
describe("async:initialization", function() {
  it("jstag should exist but should not be loaded", function() {
    // validate
    expect(window.jstag).toBeDefined();
    expect(window.jstag.isLoaded).not.toBeDefined();
  });

  it("should have the proper functions defined", function(){
    expect(window.jstag.ready).toBeDefined();
    expect(window.jstag.bind).toBeDefined();
    expect(window.jstag.send).toBeDefined();
    expect(window.jstag.mock).toBeDefined();
    expect(window.jstag.identify).toBeDefined();
    expect(window.jstag.pageView).toBeDefined();
    expect(window.jstag.block).toBeDefined();
    expect(window.jstag.unblock).toBeDefined();
  });
});

// verify that the config is loaded, populated and events fired before io loads are stored
describe("async:pre-initialization queue", function() {
  it("queue should capture events and store them", function() {
    // attempt some sends
    window.jstag.send({"sample1":true});
    window.jstag.send({"sample2":true});

    // validate
    expect(window.jstag._q.length).toBe(2);
    expect(window.jstag._q[0][2][0].sample1).toBe(true);
    expect(window.jstag._c.cid).toBe('{{account.id}}');
    expect(window.jstag._c.url).toBe('//c.lytics.io');
  });
});