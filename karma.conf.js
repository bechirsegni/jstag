/* eslint-env node */
// Karma configuration

module.exports = function(config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '.',

    plugins: [
      'karma-jasmine',
      'karma-coverage',
      'karma-coveralls',
      'karma-phantomjs-launcher',
      'karma-browserstack-launcher'
      // 'karma-chrome-launcher'
    ],

    browserNoActivityTimeout: 1000000,

    concurrency: 1,

    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: [ 'jasmine' ],

    // list of files / patterns to load in the browser
    files: [
    ],

    // list of files to exclude
    exclude: [
    ],

    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
    },

    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: [
      'progress',
      'coverage',
      'coveralls'
    ],

    // web server port
    port: 9876,

    // enable / disable colors in the output (reporters and logs)
    colors: true,

    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,

    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,

    browserStack: {
      username: process.env.BROWSERSTACK_USERNAME,
      accessKey: process.env.BROWSERSTACK_ACCESS_KEY,
      binaryBasePath: process.cwd()
    },

    customLaunchers: {
      // MSIE
      bs_ie8: {
        base: 'BrowserStack',
        os: 'Windows',
        os_version: '7',
        browser: 'ie',
        browser_version: '8.0'
      },

      // Firefox
      bs_firefox_mac: {
        base: 'BrowserStack',
        browser: 'firefox',
        browser_version: '21.0',
        os: 'OS X',
        os_version: 'Mountain Lion'
      },

      // iOS:
      bs_iphone5: {
        base: 'BrowserStack',
        device: 'iPhone 5',
        os: 'ios',
        os_version: '6.0'
      },
      bs_iphone6: {
        base: 'BrowserStack',
        device: 'iPhone 6',
        os: 'ios',
        os_version: '8.3'
      },
      bs_iphone6plus: {
        base: 'BrowserStack',
        device: 'iPhone 6 Plus',
        os: 'ios',
        os_version: '8.3'
      },
      bs_ipad3: {
        base: 'BrowserStack',
        device: 'iPad 3rd (6.0)',
        os: 'ios',
        os_version: '6.0'
      },
      bs_iphone6s: {
        base: 'BrowserStack',
        device: 'iPhone 6S',
        os: 'ios',
        os_version: '9.1'
      },
      bs_iphone6splus: {
        base: 'BrowserStack',
        device: 'iPhone 6S Plus',
        os: 'ios',
        os_version: '9.1'
      },

      // Android:
      bs_nexus4: {
        base: 'BrowserStack',
        device: 'Google Nexus 4',
        os: 'android',
        os_version: '4.2'
      },
      bs_samsunggalaxys5: {
        base: 'BrowserStack',
        device: 'Samsung Galaxy S5',
        os: 'android',
        os_version: '4.4'
      },

      // Cannot reach network:
      // Note: this is due to an issue with local proxying on more recent android versions BrowserStack
      bs_nexus5: {
        base: 'BrowserStack',
        device: 'Google Nexus 5',
        os: 'android',
        os_version: '5.0'
      }
    },
    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: [
      'PhantomJS',
      'bs_ie8'
      // 'bs_firefox_mac',
      // 'bs_iphone5',
      // 'bs_iphone6',
      // 'bs_iphone6plus'
      // 'bs_ipad3'
      // 'bs_iphone6s'
      // 'bs_iphone6splus'
      // 'bs_nexus4',
      // 'bs_samsunggalaxys5'
      // 'bs_nexus5'
    ],
    // browsers: ['Chrome'],
    // browsers: ['Chrome', 'ChromeCanary', 'Firefox', 'Safari', 'PhantomJS', 'Opera', 'IE'],

    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false
  });
};
