// JS Library for data collection. Apache License.
// https://github.com/lyticsio/jstag
(function(win,doc,context) {
  var dloc = doc.location
    , ckie = doc.cookie
    , dref = doc.referrer
    , jstag = win.jstag || {}
    , l = 'length'
    , cache = {}
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
   */
  jstag.config = {
    url:''
    , Q:[]
    , id: undefined
    , cid : undefined
    , serializer:toString
    , pipeline:['identity','analyze']
    , delay:200
    , cookie:"seerid"
    , sesname:"seerses"
    , sessecs: 1800 
    , channel:'Form'//  Form,Gif,ws,cors,jsonp
  }

  function objType(it,oname) {
    return otostr.call(it) === "[object " + oname + "]";
  }
  function isFn(it){return objType(it,'Function')};
  function isObject(it){return objType(it,'Object')};
  function isString(it){return objType(it,'String')};
  function isArray(it){return objType(it,'Array')};

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
   * The connect function accepts config object
   */
  function connect(opts,cb){
    extend(jstag.config,opts,true)
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
   * Replace the temporary Q object
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
      if (!(this instanceof Gif)) return new Gif(opts);
      return {
        images:[],
        /**
        * Sends the data
        */
        send:function(data,o){
          if (doc.images){
            var gif = this,
              img = new Image(),
              onFinish = function(){
                if (!o.callback.hasRun){
                  o.callback.hasRun=true;
                  o.callback(o);
                }
              };
            this.images.push(img);
            if (arguments.length === 2 && o && isFn(o.callback)){
              o.callback.hasRun=false;
              img.onload = onFinish();
              win.setTimeout(onFinish, Io.config.delay);
            }
            img.src=this.getUrl();
          }
        },
        /**
         * Creates the url to be sent to the collection server
         */
        getUrl:function(){
          
        }
        
      }
    },
    /**
     * @class channels.Form
     * Gif:  uses an iframe to post values
     * @constructur
    */
    Form: function(opts){
       // form based communication channel
      this.config = opts
      var self = this;
      return {
        send: function(data,o){
          var iframe = doc.createElement("iframe"),
            form,
            inp;
          doc.body.appendChild(iframe);
          iframe.style.display = "none";
          setTimeout(function() {
            form = iframe.contentWindow.document.createElement("form");
            iframe.contentWindow.document.body.appendChild(form);
            form.setAttribute("action", opts.url);
            form.setAttribute("method", "post");
            inp = iframe.contentWindow.document.createElement("input");
            inp.setAttribute("type", "hidden");
            inp.setAttribute("name", "_js");
            inp.value = data;
            form.appendChild(inp);
            form.submit();
            if (o && isFn(o.callback)) (o.callback(o));
            setTimeout(function(){
              doc.body.removeChild(iframe);
            }, 2000);
          }, 0);
        }
      }
    }
  }


  // the core page analysis
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
      if (!("url" in o.data)) {
        o.data['url'] = dloc.href.replace("http://","").replace("https://","");
      }
    },
    identity: function(o){
      if (!("_uid" in o.data)) { // don't replace uid if supplied
        var ckieid = "seerid"
          , sid
        if (o.config && o.config.cookie) ckieid = o.config.cookie
        sid = ckieGet(ckieid);
        o.config.url = addQs(o.config.url, "_uidn", ckieid)
        if (sid && sid[l]) o.data['_uid']=sid
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
  */
  function send(data,cb){
    if ('io' in cache){
      cache['io'].forEach(function(io){
        io.send(data,cb);
      })
    } else {
      var io = new Io();// this will auto-cache
      io.send(data,cb);
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
        //extend(Io.config,jstag.config,true)
        o = extend(opts ? opts : {}, jstag.config);
        if (!jstag.config.url || !jstag.config.cid) throw new Error("Must have collection url and Account");
        if ('cid' in o && !jstag.config.cid) jstag.config.cid = o.cid;

        o.url = jstag.config.url + '/c/' + jstag.config.cid;
        if (o.stream) o.url += "/" + o.stream
        this.config = o;
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
      send : function(data,cb) {
        data = data ? data : {};
        this.data = data;
        data["_ts"] = new Date().getTime();
        // todo, support json or n/v serializer?
        var opts = {data:data,callback:cb,config:this.config},
          self = this;
        // run pre-work
        _pipe.forEach(function(fn){
          fn(opts)
        })
        _pipe = _pipe.filter(function(fn){
          return !fn.onetime
        })

        jstag.emit("send.before", opts)

        // now send
        this.channel.send(this.serializer(opts.data),{callback:function(){
          if (isFn(cb)){
            cb(opts,self);
          }
          jstag.emit("send.finished",opts,self)
        }}); 
      },
      debug:function(){
        return "<table><tr><th>field</th><th>value</th></tr>" + oToS(this.data) + "</table>"
      }
    }
  }()

  function oToS(o,lead){
    var s = '';
    lead = lead || ''
    for (p in o){
      if (isObject(o[p])) {
        s += oToS(o[p], p + ".")
      } else {
        s+="<tr><td>"+lead + p+"</td><td>"+o[p]+"</td></tr>"
      }
    }
    return s
  }


  if (win && 'AsyncInit' in win && isFn(win.AsyncInit)){
    win.AsyncInit();
  }
  

  if (!("ready" in jstag)){
    jstag.ready = function(){}
  }
  
  jstag['load'] = function() {return this}; 

  replaceTempQ();
  jstag.emit("ready")
  

}(window,document));

