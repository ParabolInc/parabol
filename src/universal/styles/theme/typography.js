import { StyleSheet } from 'react-look';

const typography = {

  // Font stacks
  sansSerif: "'Karla', 'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",
  serif: "'Merriweather', 'Georgia', 'Times New Roman', 'Times', serif",
  monospace: "'Menlo', 'Monaco', 'Consolas', 'Courier New', monospace",

  // Typography scale (matches a subset of Sketch defaults)
  sBase: '1rem',  // 16px
  s1: '.75rem',   // 12px
  s2: '.8125rem', // 13px
  s3: '.875rem',  // 14px
  s4: '1.125rem', // 18px
  s5: '1.25rem',  // 20px
  s6: '1.5rem',   // 24px
  s7: '2.25rem',  // 36px
  s8: '3rem',     // 48px
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
  // TODO: Switch to '.woff' files (TA)
  // TODO: Consider '.eot' files for IE (TA)
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
