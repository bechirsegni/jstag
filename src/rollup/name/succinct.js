import document from '../dom/document';
import arraySlice from '../util/array-slice';
import filter from '../util/filter';
import map from '../util/map';

export default (function getSuccintGlobalName() {
  var scriptsHostObject = document.getElementsByTagName('script');
  var scripts = arraySlice(scriptsHostObject);
  var metasHostObject = document.getElementsByTagName('meta');
  var metas = arraySlice(metasHostObject);
  var attributes = filter(map(scripts.concat(metas), function(tag) {
    return tag.getAttribute('data-lytics-global');
  }), Boolean);

  if (attributes.length > 1) {
    throw new Error(
      'This page specified more than one data-lytics-global attribute. ' +
      'You should put the attribute on either a meta tag, or the script ' +
      'element itself, but not both'
    );
  }
  if (attributes.length === 1) {
    return attributes[0];
  }
  return 'jstag';
}());
