
(function (w) {
    // Wrap any existing `onload` function with our own that will cache the
    // loaded state of the page.   We are now going to look for any methods that have been 
    // called on the "queue" array, and submit them
    var oldonload = w.onload;
    w.onload = function () {
        var aq = w.analyticsq
          , at = w.analytics
        if (!at.utils.isArray(aq)){
          aq = []
        }
        if (!aq.initialize){
          aq.initialize = function(args){
            at.initialize.call(args)
          }
        }
        if (aq.asyncInit && at.utils.isFunction(aq.asyncInit)){
          aq.asyncInit()
        } 
        while (w.analyticsq.length > 0) {
            var n = w.analyticsq.shift(), r = n.shift();
            at[r] && at[r].apply(at, n)
        }
        at.pageview();

        // now load original onload
        if (at.utils.isFunction(oldonload)) oldonload();
    };
})(window);
