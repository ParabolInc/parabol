
let appTheme = {};

/* eslint-disable */
if (typeof __PRODUCTION__ !== 'undefined' && __PRODUCTION__) {
  /*
   * Production optimization, built by npm run build:server
   * and /webpack/utilsJS.js:
   */
  appTheme = require('appTheme.json');
} else {
  appTheme = require('./theme.js').default;
}
/* eslint-enable */

const exportTheme = appTheme;
export default exportTheme;
