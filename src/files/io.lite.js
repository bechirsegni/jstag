/* jshint laxcomma:true, sub:true, asi:true */
// v1.0.0 JS Library for data collection. MIT License.
// https://github.com/lytics/jstag
(function(win,doc,nav) {
  var dloc = doc.location
    , ckie = doc.cookie
    , ioVersion = "l.1.0"
    , uidv
    , l = 'length'
    , dref = referrer()
    , uri = parseUri()
    , images = []
    , jstag = win.jstag || {}
    , as = Array.prototype.slice
    , otostr = Object.prototype.toString
    , config = {
      url:''
      , delay:2000
      , cookie:"seerid"
      , sessecs: 1800 
      , qsargs: []
      , ref: true
    }
  
  function isFn(it){return otostr.call(it) === "[object Function]"}
  function isObject(it){return otostr.call(it) === "[object Object]"}
  function isString(it){return otostr.call(it) === "[object String]"}
  function isArray(it){return otostr.call(it) === "[object Array]"}
  /*
    parseUri 1.2.1
    (c) 2007 Steven Levithan <stevenlevithan.com>
    http://stevenlevithan.com/demo/parseuri/js/
    MIT License
  */
  function parseUri(str) {
    if (str === undefined){
        str = dloc.href;
    }
    var o   =  {
        strictMode: false,
        key: ["source","protocol","authority","userInfo","user","password","host","port","relative","path","directory","file","query","anchor"],
        q:   {
            name:   "qs",
            parser: /(?:^|&)([^&=]*)=?([^&]*)/g
        },
        parser: {
            strict: /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*):?([^:@]*))?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,
            loose:  /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*):?([^:@]*))?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/
        }
    }
    var m   = o.parser[o.strictMode ? "strict" : "loose"].exec(str),
        uri = {},
        i   = 14;
    while (i--) uri[o.key[i]] = m[i] || "";
    uri[o.q.name] = {};
    uri[o.key[12]].replace(o.q.parser, function ($0, $1, $2) {
        if ($1) uri[o.q.name][$1] = $2;
    });
    return uri;
  }

  jstag["parseUri"] = parseUri;

  function s16() {
     return ((1+Math.random())*0x10000).toString()
  }

  function setid(id){
    uidv = id
    var expires = new Date();
    expires.setTime(expires.getTime() + 7776000 * 1000)
    ckieSet(config.cookie, id, expires)
  }

  function getid() {
    var sid = ckieGet(config.cookie);
    if (sid && sid[l] && sid != "undefined") {
      uidv=sid
    } else {
      uidv = s16();
      setid(uidv);
    }
  }

  /**
   * the http referrer
  */
  function referrer(){
    var r = '';
    try {
        r = top.document.referrer
    } catch (e1) {
        try {
            r = parent.document.referrer
        } catch (e2) {
            r = ''
        }
    }
    if (r === '') {
        r = doc.referrer
    }
    return r
  }

  /**
   * Get a cookie
   */
  function ckieGet(name){
    if (ckie[l] > 0) { 
      var begin = ckie.indexOf(name+"="), end; 
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
    if (!domain && uri && uri.host){
      var hp = uri.host.split(".");
      if (hp.length > 1){
        domain = "." + hp[hp.length-2] +"." + hp[hp.length-1]
      }
    }
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


  function sendgif(data,cb){
    var sendurl = jstag._c.url + "/c/" + jstag._c.key 
    if (config.cookie != "seerid") {
      sendurl = addQs(sendurl, "_uidn", config.cookie)
    }
    if (doc.images){
      var gif = this
        , img = new Image()
        , onFinish = function(to){
            if (cb){
              try{
                cb(to);
              } catch (e){}
            }
          };
      images.push(img);
      if (img.onload) {
        img.onload = onFinish();
      }
      win.setTimeout(function(){
        onFinish({timeout:true})
      }, config.delay);
      img.src=getUrl(sendurl, data);
    }
  }
  /**
   * Creates the url to be sent to the collection server
   */
  function getUrl(url, data){
    if (url.indexOf("?") < 1) url += "?"
    else url += "&"
    return url + toString(data)
  }


  function isMobile(){
    var a = navigator.userAgent||navigator.vendor||window.opera
    var ism = /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))
    if (ism){
      return true
    }
    return false
  }
  // the core page analysis functions, an array of options
  function analyze(data){
    if (!("_e" in data)) data["_e"] = "pv";
    var ses = ckieGet("_jtag.ses")
      , ref
    for (var k in uri.qs) {
      if (k.indexOf("utm_") === 0){
        data[k] = uri.qs[k]
      }
    }
    if (jstag._c.qsargs) {
      var qsa = null
      for (var i = jstag._c.qsargs.length - 1; i >= 0; i--) {
        qsa = jstag._c.qsargs[i]
        if (qsa in uri.qs){
          data[qsa] = uri.qs[qsa]
        }
      }
    }

    if (!ses) {
      data['_sesstart'] = "1"
    }

    if (!("_ref" in data)) {
      if (dref && dref[l] > 1){
        var rh = dref.toString().match(/\/\/(.*)\//);
        if (rh && rh[1].indexOf(dloc.host) == -1) {
          data['_ref'] = dref.replace("http://","").replace("https://","");
          if (!ses) {
            data['_sesref'] = dref.replace("http://","").replace("https://","");
          }
        }
      }
    }

    // update the session time
    var expires = new Date();
    expires.setTime(expires.getTime() + config.sessecs * 1000)
    ckieSet(config.sesname,"e", expires)
    // some browser items
    data["_tz"] = parseInt(expires.getTimezoneOffset() / 60 * -1) || "0";
    data["_ul"] = nav.appName == "Netscape" ? nav.language : nav.userLanguage;
    if (typeof (screen) == "object") {
      data["_sz"] = screen.width + "x" + screen.height;
    }

    if (isMobile()) {
      data["_mob"] = "t"
      var mobType = "unknown"
      if (nav.userAgent.match(/Android/i)) {
        mobType="Android"
      } else if (nav.userAgent.match(/BlackBerry/i)) {
        mobType="Blackberry"
      } else if (nav.userAgent.match(/iPhone|iPad|iPod/i)) {
        mobType="IOS"
      } else if (nav.userAgent.match(/IEMobile/i)) {
        mobType="WinMobile"
      }
      data["_device"] = mobType;
    } else {
      data["_nmob"] = "t"
      data["_device"] = "desktop";
    }
    data['url'] = dloc.href.replace("http://","").replace("https://","");
    // determine if we are in an iframe
    if (win.location != win.parent.location) data["_if"] =  "t";
    // clean up uid
    if (("_uid" in data) && (!data["_uid"] || data["_uid"] == "null" || data["_uid"] == "undefined")) {
      delete data["_uid"]
    }
    var ga = ckieGet("__utma"), gai = -1
    if (ga && ga[l] > 10) {
      gai = ga.indexOf(".",10)
      data["_ga"] = ga.substring(0,gai)
    }
    if (!("_uid" in data)) { // don't replace uid if supplied
      data["_uid"] = getid();
    }
    // handle saving optimizely id
    var optzly = ckieGet("optimizelyEndUserId");
    if (optzly) {
      data["optimizelyid"] = optzly;
    }
  }

  function encode(v){
    return encodeURIComponent(v);
  }

  function toString(data, ns){
    var as = [], key = "";
    if (arguments.length == 1){
      ns = ""
    }
    for (var p in data){
      key = p
      if (ns !== "") {
        key = ns + '.' + p
      }
      if (isObject(data[p])){
        as.push(toString(data[p],p))
      } else if (isFn(data[p])) {
        as.push(key + '=' + encode(data[p]()))
      } else if (isArray(data[p])) {
        for (var ai = data[p].length - 1; ai >= 0; ai--) {
          as.push(key + '=' + encode(data[p][ai]))
        }
      } else if (isString(data[p]) && data[p].length > 0) {
        as.push(key + '=' + encode(data[p]))
      } else if (data[p] !== null && data[p] !== undefined ){
        as.push(key + '=' + encode(data[p]))
      }
    }
    return as.join("&");
  }

  
  jstag['send'] = function(data,cb) {
    data = data ? data : {};
    data["_ts"] = new Date().getTime();
    analyze(data)
    sendgif(data,cb)
  }

  


  if (jstag._q) {
    if (jstag._q[l] && jstag._q[l] > 0){
      for (var i = jstag._q.length - 1; i >= 0; i--) {
        if (jstag._q[i][0] == "send") {
          var args = as.call(jstag._q[i][1])
          console.log(args)
          jstag.send.apply(jstag, args)
        }
      };
    }
  }

}(window,document,window.navigator));

