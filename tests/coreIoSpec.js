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

// verify that the config is loaded, populated and events fired before io loads are stored
describe("io:pre-initialization queue", function() {
  it("queue should capture events and store them", function() {
  	window.jstag.send({"test":"one"});

  	// validate
    expect(window.jstag.config.cid).toEqual(['bogusaccountid']);
    expect(window.jstag.config.url).toBe('//c.lytics.io');
  });
});