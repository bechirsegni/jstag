var gulp = require('gulp'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename'),
    connect = require('gulp-connect'),
    replace = require('gulp-replace'),
    env = require('gulp-env'),
    Server = require('karma').Server;

// get overrides from .env file
try {
  env({
      file: '.env',
  });
  MASTERCID = process.env.CID || "bogusaccountid";
  MASTERURL = process.env.URL || "//c.lytics.io";
} catch (error) {
  MASTERCID = "bogusaccountid";
  MASTERURL = "//c.lytics.io";
}

var TESTCID = "bogusaccountid";
var TESTURL = "//c.lytics.io";


gulp.task('build', function () {
	gulp.src('src/*.js')
		.pipe(gulp.dest('out'))
    	.pipe(uglify())
    	.pipe(rename({
      		suffix: '.min'
    	}))
    	.pipe(gulp.dest('out'))
});

gulp.task('fixtures', function () {
  gulp.src('src/initobj.js')
    .pipe(replace('{{cid}}', MASTERCID))
    .pipe(replace('{{url}}', MASTERURL))
    .pipe(gulp.dest('tests/fixtures'))
});

gulp.task('fixtures:test', function () {
  gulp.src('src/initobj.js')
    .pipe(replace('{{cid}}', TESTCID))
    .pipe(replace('{{url}}', TESTURL))
    .pipe(gulp.dest('tests/fixtures'))
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
      'tests/fixtures/initobj.js',
      'tests/*AsyncSpec.js'
    ],
    port: 9876,
  }, done).start();
});

gulp.task('iotest', function (done) {
  new Server({
    configFile: __dirname + '/karma.conf.js',
    singleRun: true,
    files: [
      'out/async.min.js',
      'out/io.min.js',
      'tests/*IoSpec.js'
    ],
    port: 9976,
  }, done).start();
});

gulp.task('watch', function () {
  gulp.watch('src/**/*', ['build']);
});

gulp.task('test', ['build', 'fixtures:test', 'asynctest', 'iotest']);
gulp.task('compile', ['build']);
gulp.task('default', ['build', 'preview', 'watch']);