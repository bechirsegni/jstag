window.jstag = (function () {
  var t={_q:[],_c:{},ts:(new Date()).getTime()},l=false,w=window,d=document,src="/static/io.lite",
    as=Array.prototype.slice,sp;
  t.init=function(c){
    sp= c.js ? c.js : c.url||""
    c.ext=c.ext||".min.js"
    t._c = c
    return this
  }
  t.load=function(){
    var js,
      fjs = d.getElementsByTagName("script")[0];
    l = true;
    if (d.getElementById(src)) return this; 
    js=d.createElement("script"); 
    js.id=src;
    js.src=sp+src+t._c.ext; 
    fjs.parentNode.insertBefore(js, fjs);
    return this;
  }
  t.send=function(){
    if (!l) this.load();
    this._q.push(["send",as.call(arguments)]);
    return this;
  }
  return t
})();
