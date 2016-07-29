function getTimezone() {
  return -new Date().getTimezoneOffset() / 60;
}

function getURL() {
  return location.hostname + ':' + location.port + location.pathname;
}

function getIoVersion() {
  return window.__karma__.config.ioversion;
}

function getNavigatorLanguage() {
  return navigator.language || navigator.userLanguage;
}

function map(iter, fn) {
  var result = [];
  for (var i = 0, len = iter.length; i < len; i++) {
    result.push(fn(iter[i], i));
  }
  return result;
}

function mapBy(iter, field) {
  return map(iter, function(item) {
    return item[field];
  });
}

const jasmineMatchers = {
  toEqualString: function toEqualString(util) {
    return {
      compare: function compare(actual, expected) {
        return {
          pass: util.equals(String(actual), String(expected))
        };
      }
    };
  },
  toEqualUnordered: function toEqualUnsorted(util) {
    return {
      compare: function compare(actual, expected) {
        return {
          pass: util.equals(actual.slice().sort(), expected.slice().sort())
        }
      }
    }
  }
};
