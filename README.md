JSTag - Javascript Analytics Collector Tag
===============================================

A very simple javascript tag for collecting events from a browser to send to a server. 


Simple inline implementation:
```html
    <!--[if lt IE 8]><script src="/static/shim.js"></script><![endif]-->
    <script src="/js/io.js" type="text/javascript" />
    <script type="text/javascript">
      $(document).ready(function(e){
        jstag.init({ cid: 1}).send({myid:1234,category:'books'});
      })
    </script>
```

Async implementation.  This is better for performance, non-blocking page usage.   Use the http://github.com/lyticsio/jstag/async.js tag as a template and copy/paste (with edits) into a script block on page (do not reference the file or else the value of async is removed).  
```html
    <script type="text/javascript">
      // async js tag include (not shown)
    </script>

    <a href="#" id="testlink" >test link</a>
    <script type="text/javascript" charset="utf-8">
      $(document).ready(function(){
        $("#testlink").click(function(){
          jstag.send({event:"adding_fb_post",conversion:"posting"});
          return false;
        });
      });
    </script>
```


Advanced usage for event bindings.   Often when using a tag, you have a single *Include* of tag, and you have different portion's of your site, or different javascript libraries that need to collect different data.  In that situation, it is easy to utilize the event libraries.  
```html
    <script type="text/javascript">
      // async js tag include (not shown)
    </script>

    <script type="text/javascript" src="/js/ads.js">
      // lets maybe add information from our ad library
      jstag.bind("before.send",function(o) {
        o.data["my_id"] = "value"
        o.data["category"] = "value2"
      })
    </script>
```

