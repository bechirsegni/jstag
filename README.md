JSTag - Javascript Analytics Collector Tag
===============================================

A very simple javascript tag for collecting events from a browser to send to a server. 



```html
    <!--[if lt IE 8]><script src="/static/shim.js"></script><![endif]-->
    <script src="/js/io.js" type="text/javascript" />
    <script type="text/javascript">
      $e.ready(function(e){
        jstag.Io({ cid: 1}).send({myid:1234,category:'books'});
      })
    </script>
```


```html
    <script type="text/javascript">
      // async js tag include (not shown)
    </script>

    <a href="#" id="testlink" >test link</a>
    <script type="text/javascript" charset="utf-8">
      $(document).ready(function(){
        $("#testlink").click(function(){
          jstag.send({event,"adding_fb_post",conversion:"posting"});
          return false;
        });
      });
    </script>
```

