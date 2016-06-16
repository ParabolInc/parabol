
let theme = {};

/* eslint-disable global-require */
if (typeof __PRODUCTION__ !== 'undefined' && __PRODUCTION__) {
  /*
   * Production optimization, built by npm run build:server
   * and /src/universal/utils/buildThemeJS.js:
   */
  theme = require('theme.json');
  const clientSchema = require('clientSchema.json');
  console.log('SCHEMA', clientSchema);
  // console.log('THEME', theme);
} else {
  theme = {
    brand: require('./brand'),
    palette: require('./palette'),
    typography: require('./typography')
  };
}
/* eslint-enable */

const exportTheme = theme;
export default exportTheme;
