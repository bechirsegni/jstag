/** @module jstag/dom/hyper */
import document from './document';
import extend from '../util/extend';

/**
 * @exports hyper
 * @todo add a description
 */
export default function hyper(elementName, properties, doc) {
  doc || (doc = document);
  return extend(doc.createElement(elementName), properties);
}
