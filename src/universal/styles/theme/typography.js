import { StyleSheet } from 'react-look';

const typography = {

  // Fonts
  actionUISansSerif: "'Karla', 'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",
  actionUISerif: "'Merriweather', 'Georgia', 'Times New Roman', 'Times', serif",
  actionUIMonospace: "'Menlo', 'Monaco', 'Consolas', 'Courier New', monospace",

  // Font scales (matches a subset of Sketch defaults)
  fsBase: '1rem',  // 16px
  fs1: '.75rem',   // 12px
  fs2: '.8125rem', // 13px
  fs3: '.875rem',  // 14px
  fs4: '1.125rem', // 18px
  fs5: '1.25rem',  // 20px
  fs6: '1.5rem',   // 24px
  fs7: '2.25rem',  // 36px
  fs8: '3rem',     // 48px
};

if (typeof __WEBPACK__ !== 'undefined' && __WEBPACK__) {
  /*
   * We keep all of the required font files here and add them to
   * the react-look global stylesheet.
   *
   * TODO: these are probably more than we need, and should pair them
   *       down based upon actual usage.
   *
   * N.B, this will not run when buildThemeJSON.js is processing our
   * theme:
   */

  /* eslint-disable global-require */
  const karlaBold = require('./fonts/Karla-Bold.ttf');
  const karlaBoldItalic = require('./fonts/Karla-BoldItalic.ttf');
  const karlaItalic = require('./fonts/Karla-Italic.ttf');
  const karlaRegular = require('./fonts/Karla-Regular.ttf');

  const merriweatherBlack = require('./fonts/Merriweather-Black.ttf');
  const merriweatherBlackItalic = require('./fonts/Merriweather-BlackItalic.ttf');
  const merriweatherBold = require('./fonts/Merriweather-Bold.ttf');
  const merriweatherBoldItalic = require('./fonts/Merriweather-BoldItalic.ttf');
  const merriweatherItalic = require('./fonts/Merriweather-Italic.ttf');
  const merriweatherLight = require('./fonts/Merriweather-Light.ttf');
  const merriweatherLightItalic = require('./fonts/Merriweather-LightItalic.ttf');
  const merriweatherRegular = require('./fonts/Merriweather-Regular.ttf');
  /* eslint-enable */

  StyleSheet.font(
    'Karla',
    [karlaBold, karlaBoldItalic, karlaItalic, karlaRegular]
  );

  StyleSheet.font(
    'Merriweather',
    [
      merriweatherBlack, merriweatherBlackItalic, merriweatherBold,
      merriweatherBoldItalic, merriweatherItalic, merriweatherLight,
      merriweatherLightItalic, merriweatherRegular
    ]
  );
}

export default typography;
