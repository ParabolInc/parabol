import { StyleSheet } from 'react-look';

import karlaBold from './fonts/Karla-Bold.ttf';
import karlaBoldItalic from './fonts/Karla-BoldItalic.ttf';
import karlaItalic from './fonts/Karla-Italic.ttf';
import karlaRegular from './fonts/Karla-Regular.ttf';

import merriweatherBlack from './fonts/Merriweather-Black.ttf';
import merriweatherBlackItalic from './fonts/Merriweather-BlackItalic.ttf';
import merriweatherBold from './fonts/Merriweather-Bold.ttf';
import merriweatherBoldItalic from './fonts/Merriweather-BoldItalic.ttf';
import merriweatherItalic from './fonts/Merriweather-Italic.ttf';
import merriweatherLight from './fonts/Merriweather-Light.ttf';
import merriweatherLightItalic from './fonts/Merriweather-LightItalic.ttf';
import merriweatherRegular from './fonts/Merriweather-Regular.ttf';

const typography = {

  // Fonts:
  fontFamilyMonospace: "Menlo, Monaco, Consolas, 'Courier New', monospace !default",
  actionUISansSerif: "'Karla', 'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",
  actionUISerif: "'Merriweather', 'Georgia', 'Times New Roman', 'Times', serif",
  actionUIMonospace: "'Menlo', 'Monaco', 'Consolas', 'Courier New', monospace",

  // Font scales (matches a subset of Sketch defaults)
  fs1: '.75rem',   // 12px
  fs2: '.8125rem', // 13px
  fs3: '.875rem',  // 14px
  fs4: '1.125rem', // 18px
  fs5: '1.25rem',  // 20px
  fs6: '1.5rem',   // 24px
  fs7: '2.25rem',  // 36px
  fs8: '3rem',     // 48px
};

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

export default typography;
