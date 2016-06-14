describe("verify that we can handle an array of cid", function() {
  var async1, count=0;

  function testSend(done) {
    jstag.send("test", {"one":"one"}, function(opts, self){
      async1 = opts;
      count++;
      if(count >= 2){
        done();
      }
    });
  }

  beforeEach(function (done) {
    testSend(done);
  });

  it("should send the same data to two accounts", function () {
    expect(async1.sendurl).toEqual(['//c.lytics.io/c/bogusaccountid2/test', '//c.lytics.io/c/bogusaccountid/test']);
    expect(async1.dataMsg).toEqual('one=one&_ts=' + async1.data._ts + '&_nmob=t&_device=desktop&url=localhost%3A9976%2Fcontext.html&_if=t&_v='+window.__karma__.config.ioversion+'&_e=pv&_sesstart=1&_tz=-7&_ul=en-US&_sz=1024x768&_uid=' + async1.data._uid + '&_getid=t&_ca=jstag1')
  });
});