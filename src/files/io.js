// v1.04 JS Library for data collection. MIT License.
// https://github.com/lytics/jstag
(function(win,doc,context) {
  var dloc = doc.location
    , ckie = doc.cookie
    , dref = doc.referrer
    , jstag = win.jstag || {}
    , config = jstag.config || {}
    , l = 'length'
    , cache = {}
    , uidv = undefined
    , didGetId = undefined
    , as = Array.prototype.slice
    , otostr = Object.prototype.toString;
  
  win['jstag'] = jstag;

  if (!win.console){
   win.console = {log:function(){}};
  }

  /**
   * the public config object for io, can be set in advance
   * or you can pass into the init constructor
   *
   * @cfg {Object} config just object of properties
   * @cfg {Function} [config.serializer=toString]
   * @cfg {Array} [config.pipeline='identity','analyze'] the methods to run on init
   * @cfg {Number} [config.delay=200] in milliseconds
   * @cfg {String} [config.cookie="seerid"] the default cookie name
   * @cfg {String} [config.url='http://c.yourdomain.com']
   * @cfg {String} [config.id=""] 
   * @cfg {String} stream = default = null, if exists will append to path /c/cid/stream
   */
  jstag.config = extend(config, {
    url:''
    , Q:[]
    , id: undefined
    , cid : undefined
    , getid : jqgetid
    , serializer:toString
    , pipeline:['identity','analyze']
    , delay:200
    , path: '/c/'
    , idpath: '/cid/'
    , cookie:"seerid"
    , sesname:"seerses"
    , stream: undefined
    , sessecs: 1800 
    , channel:'Form'//  Form,Gif
  })

  function isFn(it){return otostr.call(it) === "[object Function]"}
  function isObject(it){return otostr.call(it) === "[object Object]"}
  function isString(it){return otostr.call(it) === "[object String]"}
  function isArray(it){return otostr.call(it) === "[object Array]"}

  /**
   * the classic extend, nothing special about this
   * @param target
   * @param source
   * @param overwrite (bool, optional) to overwrite
   *   target with source properties default = false.
   * @returns target
  */
  function extend(target, source, overwrite){
    if (!source) return target;
    for (p in source){
      if (source.hasOwnProperty(p) && (!(p in target) || overwrite)){
        target[p] = source[p]
      }
    }
    return target;
  }


  /**
   * the built in getid assumes you have jquery
   * @param cb = callback function (mandatory)
  */
  function jqgetid(cb){
    if (jQuery) {
      var idurl = config.url + config.idpath + config.cid;
      jQuery.ajax({url: idurl,dataType: 'jsonp',success: function(json){
        jstag.setid(json)
        didGetId = "t"
        cb(json)
      }});
    }
  }
  // setid
  jstag.setid = function(id){
    uidv = id
    ckieSet(config.cookie, id)
  }
  /**
   * the getid forces the id to load in advance
  */
  jstag.getid = function(cb) {
    if(config.getid && isFn(config.getid)){
      cb = cb ? cb : function(){}
      var sid = ckieGet(config.cookie);
      if (sid && sid[l] && sid != "undefined") {
        uidv=sid
        cb()
      } else {
        config.getid(cb)
      }
    }
    return uidv
  }

  /**
   * The connect/init function accepts config object
   */
  function connect(opts){
    config = extend(jstag.config,opts,true)
    return jstag
  }
  if ('_c' in jstag) connect(jstag._c)

  jstag["init"] = jstag['connect'] = connect;

  /* ------------- event binding -------------------
   * 
  **/
  
  var events = {}, evtConfig = {onetime:false}
  /**
   * Bind events:  accepts params, but also the cb function
   * can be marked up with a property as onetime:
   *
   *      function dowork(opts){
   *           // do work
   *      }
   *      dowork.onetime = true;
   *      jstag.bind("send.finished",dowork)
   *
   * @param the event filter (string) to bind to
   * @param callback :  the function to be called upon triggering elsewhere.
   * @param options:  {onetime:true(default=false)}
  **/
  function bind(filter,cb,opts){
    cb.opts = extend(opts?opts:{},opts)
    if (!(filter in events)){
      events[filter] = [cb]
    } else {
      events[filter].push(cb)
    }
  }
  jstag['bind'] = bind;

  /**
   * Emit events 
   * @param the event name filter (string) to bind to
  **/
  function emit(evt){
    var onetime = [],
      args = Array.prototype.slice.call(arguments,1);
    if (events[evt]&&events[evt][l]){
      for (var i=0,len=events[evt][l];i<len;i++){
        if (isFn(events[evt][i])){
          var cb = events[evt][i];
          if (cb.opts.onetime){
            onetime.push(cb);
          } else {
            cb.apply({},args);
          }
        }
      }
    }
    if (onetime[l] > 0 && events[evt]){
      events[evt] = events[evt].filter(function(el,i,a){
        return (onetime.indexOf(el) == -1);
      })
    }
    onetime.forEach(function(cb){
      cb.apply({}, args);
    })
  }
  jstag['emit'] = emit;
 
   /**
   * Replace the temporary Q object, iterating through and
   * calling the actual functions with arguments
   * the async tag provides a set of stub's which actually don't work
   * but instead get queued into Q.  
  **/
  function replaceTempQ(){
    // check for any temp events
    if ("_q" in jstag && isArray(jstag._q)){
      jstag._q.forEach(function(q){

        if (isString(q[1]) && q[1] in jstag ){
          // these are alises for not yet created fn (when put in q)
          //  q[0]    q[1]     
          // "ready", "send"
          // "ready", "send", {data:stuff}
          // "ready", "send", {data:stuff}, fn() 
          bind(q[0],function(){jstag[q[1]].apply(jstag,as.call(q[2]))})
        } else {
          // "ready", fn(), {data:stuff},
          bind.apply(jstag,[q[0]].concat(as.call(q[1])))
        }
      })
      // don't emit ready here, tooooo soon
    }
  }

  /**
   * Get a cookie
   */
  function ckieGet(name){
    if (ckie[l] > 0) { 
      var begin = ckie.indexOf(name+"="); 
      if (begin != -1) { 
        begin += name.length+1; 
        end = ckie.indexOf(";", begin);
        if (end == -1) end = ckie[l];
        return unescape(ckie.substring(begin, end)); 
      } 
    }
    return null; 
  }

  function ckieDel(name) {
    doc.cookie=name+"=; path=/; expires=Monday, 19-Aug-1996 05:00:00 GMT";
  }

  function ckieSet(name, value, expires, path, domain, secure) {
    path = path || "/"
    var cv = name + "=" + escape(value) +
        ((expires) ? "; expires=" + expires.toGMTString() : "") +
        ((path) ? "; path=" + path : "") +
        ((domain) ? "; domain=" + domain : "") +
        ((secure) ? "; secure" : "");
    doc.cookie = cv
  }

  function addQs(url, n, v) {
    if (url.indexOf("?") < 1) url += "?"
    else url += "&"
    return url + n + '=' + v
  }


  /**
   * @Object available channels
  */
  jstag.channels = {
    /**
     * @class jstag.channels.Gif
     * uses empty gif images to send the request
     * @constructur
    */
    Gif: function(opts){
      //if (!(this instanceof Gif)) return new Gif(opts);
      return {
        images:[],
        /**
        * Sends the data
        */
        send:function(data,o){
          if (doc.images){
            var gif = this,
              img = new Image(),
              onFinish = function(to){
                if (!o.callback.hasRun){
                  o.callback.hasRun=true;
                  try{
                    o.callback(to);
                  } catch (e){}
                }
              };
            this.images.push(img);
            if (arguments.length === 2 && o && isFn(o.callback)){
              o.callback.hasRun=false;
              if (img.onload) img.onload = onFinish();
              win.setTimeout(function(){onFinish({timeout:true})}, jstag.config.delay);
            }
            img.src=this.getUrl(data);
          }
        },
        /**
         * Creates the url to be sent to the collection server
         */
        getUrl:function(data){
          var url = opts.sendurl;
          if (url.indexOf("?") < 1) url += "?"
          else url += "&"
          return url + data
        }
        
      }
    },
    /**
     * @class channels.Form
     * Form:  uses an iframe to post values
     * @constructor
    */
    Form: function(opts){
       // form based communication channel
      this.config = opts
      var self = this;
      return {
        send: function(data,o){
          try {
            var iframe = doc.createElement("iframe")
              , form
              , inp
              , fid = 'f' + Math.floor(Math.random() * 99999)
              , onFinish = function(to){
                if (o && o.callback && !o.callback.hasRun){
                  o.callback.hasRun=true;
                  o.callback(to);
                }
              };
            doc.body.appendChild(iframe);
            iframe.style.display = "none";
            iframe.id = fid
            setTimeout(function() {
              form = iframe.contentWindow.document.createElement("form");
              iframe.contentWindow.document.body.appendChild(form);
              form.setAttribute("action", opts.sendurl );
              form.setAttribute("method", "post");
              inp = iframe.contentWindow.document.createElement("input");
              inp.setAttribute("type", "hidden");
              inp.setAttribute("name", "_js");
              inp.value = data;
              form.appendChild(inp);
              /*
              if ( window.addEventListener ) { 
                iframe.addEventListener( "load", onFinish, false );
              } else if ( window.attachEvent ) { 
                iframe.attachEvent( "onload", onFinish );
              } else if (iframe.onload) {
                iframe.onload = onFinish;
              } 
              */
              form.submit();
              setTimeout(function(){
                doc.body.removeChild(iframe);
                onFinish({timeout:true})
              }, config.delay * 2);
            }, 0);
          } catch(e) {
            var g = new Gif(opts)
            try {
              g.send(data)
            } catch (e){}
          }
        }
      }
    }
  }


  // the core page analysis functions, an array of options
  var pipeline = {
    analyze: function(o){
      o.data["_e"] = "pv"
      var ses = ckieGet(jstag.config.sesname)
        , ref = undefined
      if (!ses) {
        var expires = new Date();
        expires.setTime(expires.getTime() + jstag.config.sessecs * 1000)
        ckieSet(jstag.config.sesname,"e", expires)
        o.data['_sesstart'] = "1"
      }
      if (!("_ref" in o.data)) {
        if (dref && dref[l] > 1){
          var rh = dref.toString().match(/\/\/(.*)\//);
          if (rh && rh[1].indexOf(dloc.host) == -1) {
            o.data['_ref'] = dref.replace("http://","").replace("https://","");
            if (!ses) {
              o.data['_sesref'] = dref.replace("http://","").replace("https://","");
            }
          }
        }
      }  
    },
    identity: function(o){
      if (!("url" in o.data)) {
        o.data['url'] = dloc.href.replace("http://","").replace("https://","");
      }
      if (win.location != win.parent.location) o.data["_if"] =  "t";

      if ("_uid" in o.data && o.data["_uid"] == undefined) {
        delete o.data["_uid"]
      }
      if (!("_uid" in o.data)) { // don't replace uid if supplied
        if (uidv){
          o.data['_uid']=uidv
        } else {
          var sid = ckieGet(config.cookie);
          if (sid && sid[l] && sid != "undefined") {
            uidv=o.data['_uid']=sid
          }
        }
      }
      if (didGetId) {
        o.data["_getid"] = "t"
      }
    }
  }
  // make sure we only run once
  pipeline.analyze.onetime = true;

  function encode(v){
    return encodeURIComponent(v);
  }

  /**
   * toString name=value&   serializer, converts objects to flat names
   * ie {user:{id:12,name:"aaron"}} becomes user.id=12&user.name=aaron
   * and {groups:["admin","api"]} becomes groups=[admin,api]
  */
  function toString(data, ns){
    var as = [], key = "";
    if (arguments.length == 1){
      ns = ""
    }
    for (p in data){
      key = p
      if (ns != "") {
        key = ns + '.' + p
      }
      if (isObject(data[p])){
        as.push(toString(data[p],p))
      } else if (isFn(data[p])) {
        as.push(key + '=' + data[p]())
      } else if (isArray(data[p])) {
        as.push(key + '=[' + data[p].join(",") + "]")
      } else {
        as.push(key + '=' + encode(data[p]))
      }
    }
    return as.join("&");
  }

  /**
   * @class jstag.Io
   * Io constructor, base communication object for sending info
  */
  function Io(o){
    if (!(this instanceof Io)) return new Io(o);
    this.init(o);
    return this;
  }
  // expose it publicly
  jstag['Io'] = Io;

  /**
   * @Function jstag.send
   * public function for send, note this send will overwrite 
   * the temporary one in the async function
   * @param stream:  (string) optional name of stream to send to
   * @param data:  the javascript object to be sent
   * @param callback (optional):  the function to be called upon triggering elsewhere.
  */
  function send(){
    var stream,data,cb, args=arguments
    if (isString(args[0])){
      stream = args[0]
      data = args[1]
      if (args.length===3) cb = args[2]
    } else {
      data = args[0]
      if (args.length===2) cb = args[1]
    }
    if ('io' in cache){
      // it is possible to create more than 1 sender, send events multiple locations
      //  TODO:  document
      cache['io'].forEach(function(io){
        io.send(data,cb,stream);
      })
    } else {
      var io = new Io();// this will auto-cache
      io.send(data,cb,stream);
    }
  }
  jstag['send'] = send
  
  Io.prototype = function(){

    var _pipe = [],
      self = null,
      o = null;

    
    return {
      init: function(opts){
        self = this
        o = config
        if (!o.url || !o.cid) throw new Error("Must have collection url and Account");
        //if ('id' in o && !jstag.config.cid) jstag.config.cid = o.cid;
        if ('cid' in o && !o.cid) jstag.config.cid = o.cid;
        this.serializer = o.serializer;

        if (!('io' in cache)){
          cache['io'] = [this]
        } else {
          cache['io'].push(this)
        }
        this.channel = new jstag.channels[o.channel](o);

        // define pipeline
        o.pipeline.forEach(function(item){
          if (isFn(item)){
            _pipe.push(item)
          } else if (item in pipeline){
            _pipe.push(pipeline[item])
          } else if (item in win){
            _pipe.push(win[item])
          }
        })

        // if they supplied a Q, wire it up
        if (o.Q && o.length > 0){
          var i = 0, l = Q.length;
          o.Q.forEach(function(args){
            self.send.apply(self,args)
          })
        }
        if (o.Q){
          o.Q.push=function(){
            self.send.apply(self,Array.prototype.slice.call(arguments))
          }
        }
        jstag.emit("io.ready",this)
      },
      collect:function(opts,cb){
        var self = this

        jstag.emit("send.before", opts)

        // now send
        this.channel.send(this.serializer(opts.data),{callback:function(to){
          opts.returndata = to
          if (isFn(cb)){
            cb(opts,self);
          }
          jstag.emit("send.finished",opts,self)
        }}); 
      },
      send : function(data,cb,stream) {
        data = data ? data : {};
        this.data = data;
        data["_ts"] = new Date().getTime();
        // todo, support json or n/v serializer?
        var opts = {data:data,callback:cb,config:this.config}
          , self = this
          , url = o.url + o.path + o.cid;
        stream = stream || o.stream;
        o.sendurl = stream ? url + "/" + stream  : url
        if (o.sendurl.indexOf("_uidn=") == -1 && config.cookie != "seerid") {
          o.sendurl = addQs(o.sendurl, "_uidn", config.cookie)
        }
        // run pre-work
        _pipe.forEach(function(fn){
          fn(opts)
        })
        _pipe = _pipe.filter(function(fn){
          return !fn.onetime
        })

        // now for the actual collection
        if (uidv) {
          self.collect(opts,cb)
        } else if (config.getid && isFn(config.getid)) {
          config.getid(function(id){
            if (id && !(data['_uid'])) {
              data['_uid']=id
              uidv = id
            }
            self.collect(opts,cb)
          })
        } else {
          self.collect(opts,cb)
        }
        
      },
      debug:function(){
        return "<table><tr><th>field</th><th>value</th></tr>" + oToS(this.data) +
          "<tr><th>config</th></tr><tr>" + oToS(config) + "</tr></table>"
      }
    }
  }()

  function oToS(o,lead){
    var s = '';
    lead = lead || ''
    for (p in o){
      if (isObject(o[p])) {
        s += oToS(o[p], p + ".")
      } else if (isFn(o[p])) {
      } else {
        s+="<tr><td>"+lead + p+"</td><td>"+o[p]+"</td></tr>"
      }
    }
    return s
  }


  if (win && 'asyncInit' in win && isFn(win.asyncInit)){
    win.asyncInit();
  }
  

  if (!("ready" in jstag)){
    jstag.ready = function(){}
  }
  
  jstag['load'] = function() {return this}; 

  replaceTempQ();
  jstag.emit("ready")
  

}(window,document));

