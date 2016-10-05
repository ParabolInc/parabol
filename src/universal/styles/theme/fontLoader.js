import karlaWoff2 from 'universal/styles/theme/fonts/Karla-regular.woff2';
import karlaItalicWoff2 from 'universal/styles/theme/fonts/Karla-italic.woff2';
import karlaBoldWoff2 from 'universal/styles/theme/fonts/Karla-700.woff2';
import karalaBoldItalicWoff2 from 'universal/styles/theme/fonts/Karla-700italic.woff2';
import merriweatherWoff2 from 'universal/styles/theme/fonts/Merriweather-regular.woff2';
import merriweatherItalicWoff2 from 'universal/styles/theme/fonts/Merriweather-italic.woff2';
import merriweatherBoldWoff2 from 'universal/styles/theme/fonts/Merriweather-700.woff2';
import merriweatherBoldItalicWoff2 from 'universal/styles/theme/fonts/Merriweather-700italic.woff2';

import karlaTrueType from 'universal/styles/theme/fonts/Karla-regular.ttf';
import karlaItalicTrueType from 'universal/styles/theme/fonts/Karla-italic.ttf';
import karlaBoldTrueType from 'universal/styles/theme/fonts/Karla-700.ttf';
import karalaBoldItalicTrueType from 'universal/styles/theme/fonts/Karla-700italic.ttf';
import merriweatherTrueType from 'universal/styles/theme/fonts/Merriweather-regular.ttf';
import merriweatherItalicTrueType from 'universal/styles/theme/fonts/Merriweather-italic.ttf';
import merriweatherBoldTrueType from 'universal/styles/theme/fonts/Merriweather-700.ttf';
import merriweatherBoldItalicTrueType from 'universal/styles/theme/fonts/Merriweather-700italic.ttf';

const fontStylesRegular = {fontWeight: 400, fontStretch: 'normal', fontStyle: 'normal'};
const fontStylesItalic = {fontWeight: 400, fontStretch: 'normal', fontStyle: 'italic'};
const fontStylesBold = {fontWeight: 700, fontStretch: 'normal', fontStyle: 'normal'};
const fontStylesBoldItalic = {fontWeight: 700, fontStretch: 'normal', fontStyle: 'italic'};

const makeFont = (fontFamily, woffFile, ttfFile, style) => ({
  ...style,
  fontFamily,
  src: `url('${woffFile}') format('woff2'), url('${ttfFile}') format('truetype')`
});


const karla = makeFont('Karla', karlaWoff2, karlaTrueType, fontStylesRegular);
const karlaItalic = makeFont('Karla', karlaItalicWoff2, karlaItalicTrueType, fontStylesItalic);
const karlaBold = makeFont('Karla', karlaBoldWoff2, karlaBoldTrueType, fontStylesBold);
const karlaBoldItalic = makeFont('Karla', karalaBoldItalicWoff2, karalaBoldItalicTrueType, fontStylesBoldItalic);

const merriweather = makeFont('Merriweather', merriweatherWoff2, merriweatherTrueType, fontStylesRegular);
const merriweatherItalic = makeFont('Merriweather', merriweatherItalicWoff2, merriweatherItalicTrueType, fontStylesItalic);
const merriweatherBold = makeFont('Merriweather', merriweatherBoldWoff2, merriweatherBoldTrueType, fontStylesBold);
const merriweatherBoldItalic = makeFont('Merriweather', merriweatherBoldItalicWoff2, merriweatherBoldItalicTrueType, fontStylesBoldItalic);

export default [
  karla,
  karlaItalic,
  karlaBold,
  karlaBoldItalic,
  merriweather,
  merriweatherItalic,
  merriweatherBold,
  merriweatherBoldItalic
];

