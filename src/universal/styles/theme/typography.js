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
  // TODO: Switch to .woff files (TA)
  // TODO: Consider .eot files for IE (TA)
  const karlaRegular = require('./fonts/Karla-Regular.ttf');
  const karlaItalic = require('./fonts/Karla-Italic.ttf');
  const karlaBold = require('./fonts/Karla-Bold.ttf');
  const karlaBoldItalic = require('./fonts/Karla-BoldItalic.ttf');

  const merriweatherRegular = require('./fonts/Merriweather-Regular.ttf');
  const merriweatherItalic = require('./fonts/Merriweather-Italic.ttf');
  const merriweatherBold = require('./fonts/Merriweather-Bold.ttf');
  const merriweatherBoldItalic = require('./fonts/Merriweather-BoldItalic.ttf');
  /* eslint-enable */

  const fontStylesRegular = {fontWeight: 400, fontStretch: 'normal', fontStyle: 'normal'};
  const fontStylesItalic = {fontWeight: 400, fontStretch: 'normal', fontStyle: 'italic'};
  const fontStylesBold = {fontWeight: 700, fontStretch: 'normal', fontStyle: 'normal'};
  const fontStylesBoldItalic = {fontWeight: 700, fontStretch: 'normal', fontStyle: 'italic'};

  StyleSheet.font('Karla', [karlaRegular], fontStylesRegular);
  StyleSheet.font('Karla', [karlaItalic], fontStylesItalic);
  StyleSheet.font('Karla', [karlaBold], fontStylesBold);
  StyleSheet.font('Karla', [karlaBoldItalic], fontStylesBoldItalic);

  StyleSheet.font('Merriweather', [merriweatherRegular], fontStylesRegular);
  StyleSheet.font('Merriweather', [merriweatherItalic], fontStylesItalic);
  StyleSheet.font('Merriweather', [merriweatherBold], fontStylesBold);
  StyleSheet.font('Merriweather', [merriweatherBoldItalic], fontStylesBoldItalic);
}

export default typography;
