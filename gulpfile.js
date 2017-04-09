/* eslint-env node */
const gulp = require('gulp');
const series = require('gulp-sequence');
const uglify = require('gulp-uglify');
const rename = require('gulp-rename');
const connect = require('gulp-connect');
const replace = require('gulp-replace');
const env = require('gulp-env');
const karma = require('karma');
const eslint = require('gulp-eslint');
const jsdoc2md = require('gulp-jsdoc-to-markdown');
const gutil = require('gulp-util');
const sweet = require('gulp-sweetjs');
const concat = require('gulp-concat');
const filter = require('gulp-filter');
const insert = require('gulp-insert');
const rollup = require('rollup');
const fs = require('fs');

const TestServer = require('./tests/server');
const tagRelease = require('./build/tag-release');
const testDeadCodeElimination = require('./build/test-dead-code-elimination');

const {
  JSTAG_DIST_DIR,
  JSTAG_DIST_LEGACY_DIR,
  JSTAG_DIST_MODERN_DIR,
  JSTAG_DIST_DEV_DIR,
  JSTAG_DIST_RELEASE_DIR,

  JSTAG_COVERAGE_DIR,
  JSTAG_COVERAGE_ASYNC_DIR,

  COVERALLS_REPO_TOKEN,
} = require('./config');

let version;
let ioversion;
let asyncversion;
let productionCid = '{{account.id}}';
let productionUrl = '//c.lytics.io';

// Seems like an eslint bug is forcing me to make an exception for these:
/* eslint-disable no-unused-vars */
let masterCid;
let masterUrl;
/* eslint-enable no-unused-vars */


/*
* handles the cid and url overrides from the .env file
*/
try {
  env({
    file: '.env.json'
  });
  masterCid = process.env.cid || productionCid;
  masterUrl = process.env.url || productionUrl;
} catch (error) {
  masterCid = productionCid;
  masterUrl = productionUrl;
}

/*
* sets master version information
*/
(function setVersion() {
  const obj = JSON.parse(fs.readFileSync('src/versioning.json', 'utf8'));
  const package = JSON.parse(fs.readFileSync('package.json', 'utf8'));

  version = package.version;
  ioversion = obj.ioversion;
  asyncversion = obj.asyncversion;

  if (version === '' || ioversion === '' || asyncversion === '') {
    throw 'invalid version files, can not be built';
  }
}());

/*
* generates the master config used in async init
*/
function generateConfig(env) {
  const config = fs.readFileSync('src/initobj.js', 'utf8');

  if (env !== 'development') {
    masterCid = productionCid;
    masterCid = productionUrl;
  }

  return config;
}

/*
* primary build tasks
* legacy: minifies legacy files, to be removed entirely in near future
* production: uses hard coded cid and url for templating purposes
* development: uses .env.json if it exists for falls back to production settings
*/
gulp.task('build:legacy', () =>
  gulp.src([ 'src/legacy/async.js', 'src/legacy/io.js' ])
    .pipe(gulp.dest(JSTAG_DIST_LEGACY_DIR))
    .pipe(uglify())
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(gulp.dest(JSTAG_DIST_LEGACY_DIR)));

// TODO: rename this task
gulp.task('build:stage', () => {
  const initobj = generateConfig('production');

  return gulp.src([ 'src/async.js', 'src/emitter.js' ])
    .pipe(replace('{{version}}', version))
    .pipe(replace('{{asyncversion}}', asyncversion))
    .pipe(replace('{{ioversion}}', asyncversion))
    .pipe(replace('{{initobj}}', initobj))
    .pipe(replace('{{initcid}}', productionCid))
    .pipe(replace('{{initurl}}', productionUrl))
    .pipe(gulp.dest(JSTAG_DIST_DEV_DIR));
});

gulp.task('build:vendor', () =>
  gulp.src('vendor/*.js')
    .pipe(concat('vendor.js'))
    .pipe(uglify())
    .pipe(insert.prepend('/* istanbul ignore next */\n'))
    .pipe(gulp.dest(JSTAG_DIST_DEV_DIR)));

gulp.task('build:io.js', () =>
  rollup.rollup({ entry: './src/rollup/io.js' })
    .then(bundle => bundle.write({
      format: 'iife',
      dest: `${JSTAG_DIST_DEV_DIR}/io.js`
    })));

gulp.task('build:optimize:argument-slice', () =>
  gulp.src(`${JSTAG_DIST_DEV_DIR}/*.js`)
    .pipe(sweet({
      modules: [ 'sweet-array-slice' ],
      readableNames: true
    }))
    .pipe(gulp.dest(JSTAG_DIST_DEV_DIR)));

gulp.task('build:core', () =>
  gulp.src([
    `${JSTAG_DIST_DEV_DIR}/async.js`,
    `${JSTAG_DIST_DEV_DIR}/emitter.js`,
    `${JSTAG_DIST_DEV_DIR}/io.js`
  ])
    .pipe(gulp.dest(JSTAG_DIST_RELEASE_DIR)));

gulp.task('build:library', series(
  'lint',
  'build:stage',
  'build:vendor',
  'build:io.js',
  'build:optimize:argument-slice',
  'build:core'
));

gulp.task('build:compat', () =>
  gulp.src([
    `${JSTAG_DIST_RELEASE_DIR}/vendor.js`,
    `${JSTAG_DIST_RELEASE_DIR}/io.js`
  ])
    .pipe(concat('io.compat.js'))
    .pipe(gulp.dest(JSTAG_DIST_RELEASE_DIR)));

gulp.task('build:minify', () =>
  gulp.src(`${JSTAG_DIST_RELEASE_DIR}/*.js`)
    .pipe(filter([ '*', '!*.min.js' ]))
    .pipe(uglify({
      mangle: false,
      compress: {
        unsafe: true,
        // TODO: audit truly pure functions. Note that higher order functions
        //     cannot be considered pure functions because the functions they
        //     operate on may not be pure.
        pure_funcs: [ 'uncurryThis', 'noop' ]
      }
    }))
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(gulp.dest(JSTAG_DIST_RELEASE_DIR)));

// We mangle names so the file is maximally small on disk, and as a thin
// obfuscatory layer, but we do so as a separate step, so we can first test
// that dead code elimination optimizations were successful. NOTE: Name
// mangling doesn't help much if at all with gzipped file size.
gulp.task('build:mangle', () =>
  gulp.src(`${JSTAG_DIST_RELEASE_DIR}/*.min.js`)
    .pipe(uglify({ mangle: true }))
    .pipe(gulp.dest(JSTAG_DIST_RELEASE_DIR)));

gulp.task('build:production', series(
  'build:library',
  'build:compat',
  'build:minify',
  'test:dead-code-elimination',
  'build:mangle'
));

/*
* testing tasks
*/
gulp.task('test:async.js', done => {
  const library = `${JSTAG_DIST_RELEASE_DIR}/async.js`;
  const preprocessors = {};

  preprocessors[library] = 'coverage';

  const server = new karma.Server({
    configFile: __dirname + '/karma.conf.js',
    client: {
      asyncversion: asyncversion,
      ioversion: ioversion
    },
    singleRun: true,
    files: [
      library,
      'tests/coreAsyncSpec.js'
    ],
    preprocessors: preprocessors,
    coverageReporter: {
      type : 'html',
      dir : JSTAG_COVERAGE_ASYNC_DIR
    },
    port: 9776
  });

  server.on('run_complete', (browsers, results) => {
    done(results.error ? 'There are test failures' : null);
  });

  server.start();
});

(function testServer() {
  const testServer = new TestServer(3002);

  gulp.task('test-server:start', done => { testServer.open(done); });

  gulp.task('test-server:stop', () => { testServer.close(); });
}());

gulp.task('test:io.js', done =>
  karmaRun(`${JSTAG_DIST_RELEASE_DIR}/io.compat.js`, [
    'tests/add-meta-tag.js',
    `${JSTAG_DIST_RELEASE_DIR}/io.compat.js`,
    `${JSTAG_DIST_RELEASE_DIR}/emitter.js`,
    'util/test-helpers.js',
    'tests/utilSpec.js',
    'tests/coreIoSpec.js',
    'tests/dualIoSpec.js',
    'tests/eventEmitterSpec.js',
//    'tests/noConflictSpec.js'
  ], done));

gulp.task('test:dead-code-elimination', testDeadCodeElimination);

gulp.task('publish-version', () =>
  gulp.src(`${JSTAG_DIST_RELEASE_DIR}/*`)
    .pipe(gulp.dest(JSTAG_DIST_RELEASE_DIR))
    .pipe(gulp.dest(`${JSTAG_DIST_DIR}/${version}`)));

/*
* code linting
*/
gulp.task('lint', () =>
  gulp.src([ 'src/emitter.js', 'src/rollup/**/*.js' ])
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError()));

/*
* docs
*/
gulp.task('docs', () =>
  gulp.src([ `${JSTAG_DIST_RELEASE_DIR}/*` ])
    .pipe(jsdoc2md({ template: fs.readFileSync('./docs/readme.hbs', 'utf8') }))
    .on('error', err => {
      gutil.log(gutil.colors.red('jsdoc2md failed'), err.message);
    })
    .pipe(rename(path => { path.extname = '.md'; }))
    .pipe(gulp.dest('.')));

/*
* supporting tasks
*/
gulp.task('preview', () =>
  connect.server({
    port: 8080,
    root: './out/',
    livereload: true
  }));

gulp.task('tag', tagRelease);

gulp.task('watch', () =>
  gulp.watch('src/*.js', series('builddev', 'lint')));

// builds for the development environment and runs all tests
gulp.task('test:acceptance', series('test-server:start', 'test:io.js', 'test-server:stop'));
gulp.task('test:acceptance:compat', series('test:acceptance'));
gulp.task('test', series('build:production', 'build:legacy', 'test:acceptance'));

gulp.task('release', series('test', 'publish-version'));

// builds for production using hard coded cid and url
// gulp.task('buildprod', series('build:production', 'build:legacy'));

gulp.task('default', [ 'build:production' ]);

function karmaRun(library, files, done) {
  const preprocessors = {};

  preprocessors[library] = 'coverage';

  const server = new karma.Server({
    configFile: __dirname + '/karma.conf.js',
    client: {
      asyncversion: asyncversion,
      ioversion: ioversion
    },
    singleRun: true,
    files: files,
    preprocessors: preprocessors,
    coverageReporter: {
      dir: JSTAG_COVERAGE_DIR,
      type: 'lcov'
    },
    coverallsReporter: {
      repoToken: COVERALLS_REPO_TOKEN
    },
    port: 9876
  });

  server.on('run_complete', (browsers, results) => {
    done(results.error ? 'There are test failures' : null);
  });

  server.start();
}
