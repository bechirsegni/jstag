var gulp = require('gulp'),
    series = require('gulp-sequence'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename'),
    connect = require('gulp-connect'),
    replace = require('gulp-replace'),
    env = require('gulp-env'),
    open = require('gulp-open'),
    karma = require('karma'),
    fs = require('fs'),
    eslint = require('gulp-eslint'),
    strip = require('gulp-strip-comments'),
    jsdoc2md = require('gulp-jsdoc-to-markdown'),
    gutil = require('gulp-util')
    sweet = require('gulp-sweetjs');

var TestServer = require('./tests/server');

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
(function setVersion () {
  var obj = JSON.parse(fs.readFileSync('src/versioning.json', 'utf8'));
  var package = JSON.parse(fs.readFileSync('package.json', 'utf8'));

  version = package.version;
  ioversion = obj.ioversion;
  asyncversion = obj.asyncversion;

  if (version === "" || ioversion === "" || asyncversion === "") {
    throw 'invalid version files, can not be built';
  }
}());

/*
* generates the master config used in async init
*/
function generateConfig (env) {
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
gulp.task('build:legacy', function () {
  return gulp.src(['src/legacy/async.js', 'src/legacy/io.js'])
    .pipe(gulp.dest('out/legacy'))
    .pipe(uglify())
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(gulp.dest('out/legacy'));
});

gulp.task('build:production', function () {
  var initobj = generateConfig('production');

  return gulp.src(['src/async.js', 'src/io.js', 'src/emitter.js'])
    .pipe(replace('{{version}}', version))
    .pipe(replace('{{asyncversion}}', asyncversion))
    .pipe(replace('{{ioversion}}', asyncversion))
    .pipe(replace('{{initobj}}', initobj))
    .pipe(replace('{{initcid}}', production_cid))
    .pipe(replace('{{initurl}}', production_url))
    .pipe(sweet({
      modules: ['sweet-array-slice'],
      readableNames: true
    }))
    // .pipe(strip())
    .pipe(gulp.dest('out/latest'))
    .pipe(uglify({
      compress: {
        unsafe: true,
        // TODO: audit truly pure functions. Note that higher order functions
        //     cannot be considered pure functions because the functions they
        //     operate on may not be pure.
        pure_funcs: ['uncurryThis', 'noop']
      }
    }))
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(gulp.dest('out/latest'));
});

/*
* testing tasks
*/

gulp.task('async.js', function (done) {
  var library = 'out/latest/async.js';
  var preprocessors = {};

  preprocessors[library] = 'coverage';

  var server = new karma.Server({
    configFile: __dirname + '/karma.conf.js',
    client: {
      asyncversion: asyncversion,
      ioversion: ioversion,
    },
    singleRun: true,
    files: [
      library,
      'tests/coreAsyncSpec.js',
    ],
    preprocessors: preprocessors,
    coverageReporter: {
      type : 'html',
      dir : 'coverage/async'
    },
    port: 9776,
  });

  server.on('run_complete', function (browsers, results) {
    done(results.error ? 'There are test failures' : null);
  });

  server.start();
});

(function testServer() {
  var testServer = new TestServer(3001);

  gulp.task('start-test-server', function (done) {
    testServer.open(done);
  });

  gulp.task('stop-test-server', function (done) {
    testServer.close();
    done();
  });
}());

gulp.task('io.js', function (done) {
  var library = 'out/latest/io.js';
  var preprocessors = {};

  preprocessors[library] = 'coverage';

  var server = new karma.Server({
    configFile: __dirname + '/karma.conf.js',
    client: {
      asyncversion: asyncversion,
      ioversion: ioversion,
    },
    singleRun: true,
    files: [
      'out/latest/io.js',
      'out/latest/emitter.js',
      'util/test-helpers.js',
      'tests/utilSpec.js',
      'tests/coreIoSpec.js',
      'tests/dualIoSpec.js',
      'tests/eventEmitterSpec.js'
    ],
    preprocessors: preprocessors,
    coverageReporter: {
      dir: 'coverage',
      type: 'lcov'
    },
    coverallsReporter: {
      repoToken: 'piyOM4c71ZPWZiPAbkCWUqrhColI2nSW7' // TODO: this should come from the environment
    },
    port: 9777,
  });

  server.on('run_complete', function (browsers, results) {
    done(results.error ? 'There are test failures' : null);
  });

  server.start();
});

gulp.task('publish-version', function () {
  return gulp.src('out/latest/*')
    .pipe(gulp.dest('out/latest'))
    .pipe(gulp.dest('out/' + version))
});

/*
* code linting
*/
gulp.task('lint', function () {
  return gulp.src([/*'src/async.js', */'src/io.js'])
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
});

/*
* docs
*/
gulp.task('docs', function () {
  return gulp.src(['out/latest/io.js'])
    .pipe(jsdoc2md({ template: fs.readFileSync('./docs/readme.hbs', 'utf8') }))
    .on('error', function (err) {
      gutil.log(gutil.colors.red('jsdoc2md failed'), err.message)
    })
    .pipe(rename(function (path) {
      path.extname = '.md'
    }))
    .pipe(gulp.dest('.'));
});

/*
* supporting tasks
*/
gulp.task('preview', function () {
  connect.server({
    port: 8080,
    root: './out/',
    livereload: true
  });
});

gulp.task('watch', function () {
  gulp.watch('src/*.js', series('builddev', 'lint'));
});

// builds for the development environment and runs all tests
gulp.task('test-acceptance', series('start-test-server', 'io.js', 'stop-test-server'));
gulp.task('test', series('build:production', 'build:legacy', 'lint', 'test-acceptance'));

gulp.task('release', series('test', 'publish-version'))

// builds for production using hard coded cid and url
gulp.task('buildprod', series('build:production', 'build:legacy'));

gulp.task('default', ['build:production']);
