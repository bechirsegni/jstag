const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs'));

module.exports = function testOptimizations () {
  return Promise.all([
    // File size optimization: `uncurryThis` should be removed.
    //
    // `uncurryThis` is only used for `[].slice`, but we use a sweet.js macro
    // to inline `slice` everywhere, so `uncurryThis` should be removed by dead
    // code removal during minification. In order to accomplish this, a few
    // conditions must be met:
    //     - `arraySlice` is a macro, and it should only be used with an
    //           `arguments` object. If you need to slice an array, use the
    //           `slice` method of the array itself.
    //     - sweet.js should not mangle the name of `uncurryThis`. This implies
    //           that `eval` is not used anywhere in scope, and that sweet.js
    //           is invoked with the `readableNames` option set to `true`.
    //     - there must not be any other uses of `uncurryThis`, i.e. every call
    //           to slice must be macro-expanded. This means that every call to
    //           to `arraySlice` must be written in the form of a `var`
    //           assignment statement:
    //           ```
    //           var args = arraySlice(arguments);
    //           ```
    //           this is necessary because arraySlice is a macro that expands
    //           certain `var` statements.
    //     - `uncurryThis` must be marked as a pure function in the uglifyjs
    //           configuration, and "unsafe" transformations must be enabled.
    //           This is actually safe because we know that `uncurryThis` is
    //           pure, i.e. has no side effects.
    fs.readFileAsync('out/latest/io.min.js', 'utf-8')
      .then(artifact => {
        if (artifact.indexOf('uncurryThis') !== -1) {
          throw new Error('Optimization failed: `uncurryThis` was not eliminated by dead code elimination');
        }
      }),
    // TODO: add tests for other optimizations.
  ]);
};
