describe("JSTag", function() {

  // http://pivotal.github.com/jasmine/

  function addTag() {
    var script = document.createElement( 'script' );
    script.type = 'text/javascript';
    script.src = "async.test.js";
    $("head").append( script );
  }
  function deleteAllCookies() {
    var cookies = document.cookie.split(";");
    var ct = cookies.length
    for (var i = 0; i < cookies.length; i++) {
      var cookie = cookies[i];
      var eqPos = cookie.indexOf("=");
      var name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
      document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
    }
  }
  function startIo() {
    deleteAllCookies()
  }

  startIo()

  beforeEach(function() {

  });

  describe("default state of jstag", function() {
    it("should get defined", function() {
      expect(window.jstag).toBeDefined();
      expect(jstag.config).toBeDefined();
    });
    it("should have a getid function", function() {
      expect(jstag.getid).toBeDefined();
      expect(typeof(jstag.getid) == "function").toBe(true)
    });
    it("should have config, cid", function() {
      expect(jstag.config).toEqual(jasmine.any(Object));
      expect(jstag.config.cid).toEqual(jasmine.any(String))
    });
    it("jstag should have uid be undefined (we deleted cookies)", function() {
      uid = jstag.getid()
      console.log("uid = " + uid)
      //expect(uid).toBeUndefined()
      //demonstrates use of custom matcher
      //expect(player).toBePlaying(song);
    });

  });


  var osent, io, flag=false;

  it("should send tag requests asyncrhonously and get callback data", function() {

    beforeEach(function() {
      //spyOn(jstag, 'getid');
      //spyOn(jstag, 'getid').andCallThrough();
    });

    runs(function() {
      jstag.send({category:"testingjs"},function(o,ioIn){
        osent = o
        io = ioIn
        flag = true
      })
    });

    waitsFor(function() {
      return flag;
    }, "The Send should have returned without timeout and callback data", 1500);

    runs(function() {
      // make sure we got 
      expect(osent).toBeDefined();
      expect(io).toBeDefined();
      //expect(jstag.getid).toHaveBeenCalled();
    });
  });


  // note this depends on the above test being async and having returned successfully
  describe("when jstag has been sent", function() {
    // spyOn(jstag, 'getid');
    // //spyOn(jstag.config, 'getid');
    //it("tracks that the getid() was called to find newid", function() {
    //   expect(jstag.getid).toHaveBeenCalled();
    //});
    // it("tracks that the config.getid() was called to find newid", function() {
    //   expect(jstag.config.getid).toHaveBeenCalled();
    // });
    it("should have a userid", function() {
      expect(osent.data._uid).toBeDefined()
    });
    it("should have returned sending info", function() {
      expect(osent.returndata).toBeDefined()
    });
    it("should have be able to getid() a userid", function() {
      uid = jstag.getid()
      expect(jstag.config.cid).toEqual(jasmine.any(String))
      expect(uid.length).toBeGreaterThan(10)
    });
    it("should have gotten native callback, NOT timeout", function() {
      expect(osent.data._timeout).not.toEqual("timeout")
    });
  });


/*
  var osent2, io2, flag2=false;
  it("Should get Uid if we undefined getid and uses html iframe return", function() {
    runs(function() {
      startIo()// delete cookies
      // undefine the jquery based "getID" and try out the html return
      jstag.config.getid = undefined
      //jstag.config.delay = 20
      jstag.send({category:"testingjs3"},function(o,ioIn){
        osent2 = o
        io2 = ioIn
        flag2 = true
      })
    });

    waitsFor(function() {
      return flag2;
    }, "The Send should have returned without timeout and callback data", 750);

    runs(function() {
      uid = osent2.return.innerHTML
      expect(osent2.return.innerHTML).toBeDefined()
      expect(uid).toEqual(jasmine.any(String))
      expect(uid.length).toBeGreaterThan(10)
    });
  });
*/
  /*
  var osent3, io3, flag3=false;
  it("should timeout if we do short request (less than 50ms)", function() {
    runs(function() {
      jstag.config.delay = 20
      jstag.send({category:"testingjs"},function(o,ioIn){
        osent3 = o
        io3 = ioIn
        flag3 = true
      })
    });

    waitsFor(function() {
      return flag3;
    }, "The Send should have returned without timeout and callback data", 20);

    runs(function() {
      // we should not have anything 
      expect(osent3).toBeNull();
      expect(io3).toBeNull();
    });
  });
  */

});

