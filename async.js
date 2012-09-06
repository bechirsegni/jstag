window.jstag = (function (c) {
  var l=false,w=window,d=document,src="/static/io",
    as=Array.prototype.slice,sp=c.js||"";
  return w.jstag || {
    load:function(){
      var js,
        fjs = d.getElementsByTagName("script")[0];
        l = true;
      if (!("JSON" in w && Array.prototype.forEach)) src+="w";
      if (d.getElementById(src)) return this; 
      js=d.createElement("script"); 
      js.id=src;
      js.src=sp+src+".js"; 
      fjs.parentNode.insertBefore(js, fjs);
      return this;
    },
    _q:[],
    _c:c,
    bind:function(e){
      this._q.push([e,as.call(arguments,1)]);
    },
    ready:function(){
      this._q.push(["ready",as.call(arguments)]);
    },
    send:function(){
      if (!l) this.load();
      this._q.push(["ready","send",as.call(arguments)]);
      return this;
    },
    ts:(new Date()).getTime()
  };
}({cid:"CUSTOMER_ID",url:'//www.yourdomain.com'})).send({"category":"hello"});
