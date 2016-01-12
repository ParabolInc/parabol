import lodash from 'lodash';

/**
 * Given a CSS file imported with webpack and a whitespace-delimited
 * list of styles, return an array of styles found in the CSS file.
 *
 * @param cssMap
 * @param stylesString
 * @returns {Array}
 */

export default (cssMap, stylesString) => {
  return lodash.chain(stylesString)
               .words(/[^ ]+/g)
               .map((style) => cssMap[style])
               .without(undefined)
               .value()
               .join(' ');
};
