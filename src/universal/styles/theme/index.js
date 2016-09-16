
let theme = {};

/* eslint-disable global-require */
if (typeof __PRODUCTION__ !== 'undefined' && __PRODUCTION__) {
  /*
   * Production optimization, built by npm run build:server
   * and /webpack/utilsJS.js:
   */
  theme = require('theme.json');
} else {
  theme = {
    brand: require('./brand'),
    palette: require('./palette'),
    typography: require('./typography'),
    ui: require('./ui')
  };
}
/* eslint-enable */

const exportTheme = theme;
export default exportTheme;
