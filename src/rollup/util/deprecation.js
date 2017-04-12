/** @module jstag/util/deprecation */
/**
 * @exports deprecation
 * @todo add a description
 */
export default function deprecation(message) {
  /* eslint-disable no-console */
  console.warn('Deprecation warning: ' + message);
  /* eslint-enable no-console */
}
