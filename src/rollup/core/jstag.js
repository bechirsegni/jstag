import getConfig from './get-config';

import getid from './getid';
import setid from './setid';
import send from './send';
import mock from './mock';
import page from './page';
import sendMessage from './send-message';
import clearCookies from './clear-cookies';
import parseEvent from './parse-event';
import block from './block';
import unblock from './unblock';
import pageAnalysis from './page-analysis';

import ioCollect from '../io/collect';
import ioGetTransport from '../io/get-transport';

import getCookie from '../cookie/get';
import setCookie from '../cookie/set';
import deleteCookie from '../cookie/delete';

import getReferrer from '../dom/get-referrer';
import parseUri from '../dom/parse-uri';
import jsonp from '../dom/jsonp';

import extend from '../util/extend';
import noop from '../util/noop';
import parseQueryString from '../util/parse-query-string';

/**
 * @private
 * @constructor JSTag
 * @param {Object} config
 * @todo document all config options
 */
export default function JSTag(config) {
  this.config = getConfig(config);
  this.referrer = getReferrer();
  this.pageData = {};
  this.blocked = false;
  this.changeId = null;
  /** @deprecated */this.listeners = {};
}

JSTag.prototype = {
  constructor: JSTag,

  getid: getid,
  setid: setid,

  parseEvent: parseEvent,

  block: block,
  unblock: unblock,

  ioCollect: ioCollect,
  ioGetTransport: ioGetTransport,

  sendMessage: sendMessage,

  send: send,
  identify: send,

  mock: mock,

  page: page,
  pageView: page,

  pageAnalysis: pageAnalysis,

  jsonp: jsonp,

  extend: extend,

  parseUri: parseUri,

  parseQueryString: parseQueryString,

  getCookie: getCookie,
  setCookie: setCookie,
  deleteCookie: deleteCookie,
  clearCookies: clearCookies,

  onIoReady: noop,
  onSendStarted: noop,
  onSendFinished: noop
};
