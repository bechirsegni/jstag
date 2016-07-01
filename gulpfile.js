var gulp = require('gulp'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename'),
    connect = require('gulp-connect'),
    replace = require('gulp-replace'),
    env = require('gulp-env'),
    open = require('gulp-open'),
    karma = require('karma'),
    fs = require('fs'),
    eslint = require('gulp-eslint'),
    strip = require('gulp-strip-comments');

var version,
    ioversion,
    asyncversion,
    production_cid = '{{account.id}}',
    production_url = '//c.lytics.io',
    master_cid,
    master_url;

/*
* handles the cid and url overrides from the .env file
*/
try {
  env({
    file: '.env.json',
  });
  master_cid = process.env.cid || production_cid;
  master_url = process.env.url || production_url;
} catch (error) {
  master_cid = production_cid;
  master_url = production_url;
}

/*
* sets master version information
*/
var setVersion = function () {
  var obj = JSON.parse(fs.readFileSync('src/versioning.json', 'utf8'));

  version = obj.version;
  ioversion = obj.ioversion;
  asyncversion = obj.asyncversion;

  if (version === "" || ioversion === "" || asyncversion === "") {
    throw 'invalid version files, can not be built';
  }
}
setVersion();

/*
* generates the master config used in async init
*/
var generateConfig = function (env) {
  var config = fs.readFileSync('src/initobj.js', 'utf8');

  if (env !== 'development') {
    master_cid = production_cid;
    master_cid = production_url;
  }

  return config;
}

/*
* primary build tasks
* legacy: minifies legacy files, to be removed entirely in near future
* production: uses hard coded cid and url for templating purposes
* development: uses .env.json if it exists for falls back to production settings
*/
gulp.task('build:legacy', function (done) {
  gulp.src(['src/legacy/async.js', 'src/legacy/io.js'])
    .on('end', function() { done(); })
    .pipe(gulp.dest('out/'))
    .pipe(uglify())
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(gulp.dest('out/'))
});

gulp.task('build:production', function (done) {
  var initobj = generateConfig('production');

  gulp.src(['src/async.js', 'src/io.js'])
    .on('end', function() { done(); })
    .pipe(replace('{{version}}', version))
    .pipe(replace('{{asyncversion}}', asyncversion))
    .pipe(replace('{{ioversion}}', asyncversion))
    .pipe(replace('{{initobj}}', initobj))
    .pipe(replace('{{initcid}}', production_cid))
    .pipe(replace('{{initurl}}', production_url))
    // .pipe(strip())
    .pipe(gulp.dest('out/' + version))
    .pipe(uglify())
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(gulp.dest('out/' + version))
});

gulp.task('build:development', function (done) {
  var initobj = generateConfig('development');

  gulp.src(['src/async.js', 'src/io.js'])
    .on('end', function() { done(); })
    .pipe(replace('{{version}}', version))
    .pipe(replace('{{asyncversion}}', asyncversion))
    .pipe(replace('{{ioversion}}', ioversion))
    .pipe(replace('{{initobj}}', initobj))
    .pipe(replace('{{initcid}}', master_cid))
    .pipe(replace('{{initurl}}', master_cid))
    // .pipe(strip())
    .pipe(gulp.dest('out/' + version))
    .pipe(uglify())
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(gulp.dest('out/' + version))
});

/*
* testing tasks
*/
gulp.task('fixtures:test', function (done) {
  var initobj = generateConfig('test');

  gulp.src(['src/initobjwrapper.js'])
    .on('end', function() { done(); })
    .pipe(replace('{{initobj}}', initobj))
    .pipe(replace('{{initcid}}', production_cid))
    .pipe(replace('{{initurl}}', production_url))
    .pipe(gulp.dest('tests/fixtures'))
});

gulp.task('asynctest', function (done) {
  new karma.Server({
    configFile: __dirname + '/karma.conf.js',
    client: {
      asyncversion: asyncversion,
      ioversion: ioversion,
    },
    singleRun: true,
    files: [
      'out/' + version + '/async.min.js',
      'tests/fixtures/initobjwrapper.js',
      'tests/coreAsyncSpec.js'
    ],
    port: 9776,
  }, done).start();
});

gulp.task('iotest', function (done) {
  new karma.Server({
    configFile: __dirname + '/karma.conf.js',
    client: {
      asyncversion: asyncversion,
      ioversion: ioversion
    },
    singleRun: true,
    files: [
      'out/' + version + '/async.min.js',
      'tests/fixtures/initobjwrapper.js',
      'out/' + version + '/io.js',
      'tests/coreIoSpec.js'
    ],
    port: 9876,
  }, done).start();
});

gulp.task('dualsendtest', function (done) {
  new karma.Server({
    configFile: __dirname + '/karma.conf.js',
    client: {
      asyncversion: asyncversion,
      ioversion: ioversion,
    },
    singleRun: true,
    files: [
      'out/' + version + '/async.min.js',
      'tests/fixtures/dualinitobj.js',
      'out/' + version + '/io.js',
      'tests/dualIoSpec.js'
    ],
    port: 9976,
  }, done).start();
});

/*
* code linting
*/
gulp.task('lint', function (done) {
  gulp.src(['out/v2/async.js', 'out/v2/io.js'])
    .on('end', function() { done(); })
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError())
});

/*
* supporting tasks
*/
gulp.task('preview', function (done) {
  connect.server({
    port: 8080,
    root: './out/',
    livereload: true
  });
  done();
});

gulp.task('watch', function () {
  gulp.watch('src/*.js', gulp.series('builddev', 'lint'));
});

// leaving this out for now but will turn back on eventually
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

// builds for the development environment and runs all tests
gulp.task('test', gulp.series('fixtures:test', 'build:production', 'build:legacy', 'lint', 'asynctest', 'iotest', 'dualsendtest'));

// builds for production using hard coded cid and url
gulp.task('buildprod', gulp.series('build:production', 'build:legacy'));

// builds for development, uses .env.json file or fallsback to production
gulp.task('builddev', gulp.series('build:development', 'build:legacy'));

// default local server using development build settings
gulp.task('default', gulp.series('build:development', 'build:legacy', 'preview', 'watch'));