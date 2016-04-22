
let theme = {};

if (typeof __PRODUCTION__ !== "undefined" && __PRODUCTION__) {
  /*
   * Production optimization, built by npm run build:server
   * and /src/universal/utils/buildThemeJS.js:
   */
  theme = require('theme-build');
} else {
  theme = {
    brand: require('./brand'),
    palette: require('./palette'),
    typography: require('./typography')
  };
}

export default theme;
