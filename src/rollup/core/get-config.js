/** @module jstag/core/get-config */
import defaultSerializer from './default-serializer';
import location from '../dom/location';
import extend from '../util/extend';
import {
  IO_VERSION,
  DEFAULT_COOKIE_NAME,
  DEFAULT_SESSION_COOKIE_NAME
} from '../config';

/**
 * @exports getConfig
 * @todo add a description
 */
export default function getConfig(config) {
  var mergedConfig = extend({
    url: '//c.lytics.io',
    location: location.href,
    payloadQueue: [],
    id: undefined,
    cid: undefined,
    loadid: undefined,
    serializer: defaultSerializer,
    delay: 2000,
    blockload: false,
    path: '/c/',
    idpath: '/cid/',
    cookie: DEFAULT_COOKIE_NAME,
    sesname: DEFAULT_SESSION_COOKIE_NAME,
    stream: undefined,
    sessecs: 1800,
    qsargs: [],
    ref: true,
    tagid: 'jstag-csdk',
    pagedata: {},
    version: IO_VERSION
  }, config);

  if (mergedConfig.cid) {
  // normalize `cid` so that it's always an array:
    mergedConfig.cid = [].concat(mergedConfig.cid);
  }

  return mergedConfig;
}
