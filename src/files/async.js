window.jstag = (function (c) {
  var tag={_q:[],_c:c,ts:(new Date()).getTime()},l=false,w=window,d=document,src="/static/io",
    as=Array.prototype.slice,sp= c.js ? c.js : c.url||"";
    c.ext=c.ext||".min.js"
  tag.load=function(){
    var js,
      fjs = d.getElementsByTagName("script")[0];
      l = true;
    if (!("JSON" in w && Array.prototype.forEach)) src+="w";
    if (d.getElementById(src)) return this; 
    js=d.createElement("script"); 
    js.id=src;
    js.src=sp+src+c.ext; 
    fjs.parentNode.insertBefore(js, fjs);
    return this;
  }
  tag.bind=function(e){
    this._q.push([e,as.call(arguments,1)]);
  }
  tag.ready=function(){
    this._q.push(["ready",as.call(arguments)]);
  }
  tag.send=function(){
    if (!l) this.load();
    this._q.push(["ready","send",as.call(arguments)]);
    return this;
  }
  w.jstag = tag;
  return tag
}({cid:"CUSTOMER_ID",url:'//collect.domain.com',js:'//static.domain.js'})).send({"category":"hello"});