window.jstag = (function () {
  var t={_q:[],_c:{},ts:(new Date()).getTime()},l=false,w=window,d=document,src="/static/io",
    as=Array.prototype.slice,sourcePath,tag="io";
  t.init=function(c){
    sourcePath= c.js ? c.js : c.url||""
    c.ext= c.min===false ? ".min.js" | ".js"
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
    js.src=sourcePath+"/static/io"+t._c.ext; 
    fjs.parentNode.insertBefore(js, fjs);
    return this;
  }
  t.bind=function(e){
    this._q.push([e,as.call(arguments,1)]);
  }
  t.ready=function(){
    this._q.push(["ready",as.call(arguments)]);
  }
  t.send=function(){
    if (!l) this.load();
    this._q.push(["ready","send",as.call(arguments)]);
    return this;
  }
  return t
})();
