var gulp = require('gulp'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename'),
    connect = require('gulp-connect'),
    replace = require('gulp-replace'),
    env = require('gulp-env'),
    Server = require('karma').Server,
    open = require('gulp-open'),
    karma = require('karma'),
    fs = require("fs");

// get overrides from .env file
try {
  env({
      file: '.env.json',
  });
  MASTERCID = process.env.cid || "{{account.id}}";
  MASTERURL = process.env.url || "//c.lytics.io";
} catch (error) {
  MASTERCID = "{{account.id}}";
  MASTERURL = "//c.lytics.io";
}

var generateConfig = function(){
  var obj = JSON.parse(fs.readFileSync('src/initobj.json', 'utf8'));
  obj.cid = MASTERCID;
  obj.url = MASTERURL;
  return obj;
}

gulp.task('fixtures:test', function (done) {
  var initobj = generateConfig();

  gulp.src(['src/initobjwrapper.js'])
    .pipe(replace('{{initobj}}', JSON.stringify(initobj, null, 2)))
    .pipe(gulp.dest('tests/fixtures'))
    done();
});

gulp.task('build', function (done) {
  var initobj = generateConfig();

	gulp.src(['src/async.js', 'src/io.js'])
    .pipe(replace('{{initobj}}', JSON.stringify(initobj, null, 2)))
		.pipe(gulp.dest('out'))
    	.pipe(uglify())
    	.pipe(rename({
      		suffix: '.min'
    	}))
    	.pipe(gulp.dest('out'))
      done();
});

gulp.task('preview', function () {
  connect.server({
    port: 8080 ,
    root: './out',
    livereload: true
  });
});

gulp.task('asynctest', function (done) {
  new Server({
    configFile: __dirname + '/karma.conf.js',
    singleRun: true,
    files: [
      'out/async.min.js',
      'tests/fixtures/initobjwrapper.js',
      'tests/coreAsyncSpec.js'
    ],
    port: 9776,
  }, done).start();
});

gulp.task('iotest', function (done) {
  new Server({
    configFile: __dirname + '/karma.conf.js',
    singleRun: true,
    files: [
      'out/async.min.js',
      'tests/fixtures/initobjwrapper.js',
      'out/io.js',
      'tests/coreIoSpec.js'
    ],
    port: 9876,
  }, done).start();
});

gulp.task('dualsendtest', function (done) {
  new Server({
    configFile: __dirname + '/karma.conf.js',
    singleRun: true,
    files: [
      'out/async.min.js',
      'tests/fixtures/dualinitobj.js',
      'out/io.js',
      'tests/dualIoSpec.js'
    ],
    port: 9976,
  }, done).start();
});

gulp.task('watch', function () {
  gulp.watch('src/**/*', ['build']);
});

// gulp.task('unit:coverage', function(done) {
//   return new karma.Server({
//     configFile:  __dirname + '/karma.conf.js',
//     action: 'run',
//     singleRun: true,
//     preprocessors: {
//       'out/io.js': ['coverage']
//     },
//     files: [
//       'out/io.js',
//       'out/async.js'
//     ],
//     reporters: ['progress', 'coverage'],
//     coverageReporter: {
//       type : 'html',
//       dir : 'coverage/',
//       subdir: '.'
//     }
//   }, function(){
//     done();
//   }).on('error', function(err) {
//     throw err;
//   }).start();
// });

// gulp.task('coverage', gulp.series('unit:coverage'), function() {
//   return gulp.src('./coverage/index.html')
//     .pipe(open());
// });

gulp.task('test', gulp.series('fixtures:test', 'build', 'asynctest', 'iotest', 'dualsendtest'));
gulp.task('compile', gulp.series('build'));
gulp.task('default', gulp.series('build', 'preview', 'watch'));