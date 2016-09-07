/* global __lytics__jstag__, jasmineMatchers, getURL, getIoVersion, getTimezone, getNavigatorLanguage */
describe("verify that we can handle an array of cid", function() {
  var jstag = __lytics__jstag__;
  var parseQueryString = jstag.util.parseQueryString;

  beforeEach(function() {
    jasmine.addMatchers(jasmineMatchers);
  });

  beforeEach(function() {
    jstag.init({
      "cid": [
        "bogusaccountid",
        "bogusaccountid2"
      ],
      "url": "//localhost:3002",
      "loadid": false,
      "min": false
    });
  });

  var async1;
  var count = 0;

  function testSend(done) {
    jstag.pageView("test", { "one":"value1" }, function(opts) {
      async1 = opts;
      count++;
      if (count >= 2) {
        done();
      }
    });
  }

  beforeEach(function(done) {
    testSend(done);
  });

  it("should send the same data to two accounts", function() {
    expect(async1.sendurl).toEqual([ '//localhost:3002/c/bogusaccountid2/test', '//localhost:3002/c/bogusaccountid/test' ]);

    var dataMsg1 = parseQueryString(async1.dataMsg);

    expect(dataMsg1.one).toEqual('value1');
    expect(dataMsg1._ts).toEqualString(async1.data._ts);
    expect(dataMsg1._nmob).toEqual('t');
    expect(dataMsg1._device).toEqual('desktop');
    expect(dataMsg1.url).toEqual(getURL());
    expect(dataMsg1._if).toEqual('t');
    expect(dataMsg1._v).toEqual(getIoVersion());
    expect(dataMsg1._e).toEqual('pv');
    expect(dataMsg1._sesstart).toEqual('1');
    expect(dataMsg1._tz).toEqualString(getTimezone());
    expect(dataMsg1._ul).toEqual(getNavigatorLanguage());
    expect(dataMsg1._sz).toMatch(/\d+x\d+/);
    expect(dataMsg1._uid).toEqual(async1.data._uid);
    expect(dataMsg1._getid).toEqual('t');
    expect(dataMsg1._ca).toEqual('jstag1');
  });
});
