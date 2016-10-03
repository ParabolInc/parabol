import karlaWoff2 from 'universal/styles/theme/fonts/Karla-regular.woff2';
import karlaItalicWoff2 from 'universal/styles/theme/fonts/Karla-italic.woff2';
import karlaBoldWoff2 from 'universal/styles/theme/fonts/Karla-700.woff2';
import karalaBoldItalicWoff2 from 'universal/styles/theme/fonts/Karla-700italic.woff2';
import merriweatherWoff2 from 'universal/styles/theme/fonts/Merriweather-regular.woff2';
import merriweatherItalicWoff2 from 'universal/styles/theme/fonts/Merriweather-italic.woff2';
import merriweatherBoldWoff2 from 'universal/styles/theme/fonts/Merriweather-700.woff2';
import merriweatherBoldItalicWoff2 from 'universal/styles/theme/fonts/Merriweather-700italic.woff2';

const fontStylesRegular = {fontWeight: 400, fontStretch: 'normal', fontStyle: 'normal'};
const fontStylesItalic = {fontWeight: 400, fontStretch: 'normal', fontStyle: 'italic'};
const fontStylesBold = {fontWeight: 700, fontStretch: 'normal', fontStyle: 'normal'};
const fontStylesBoldItalic = {fontWeight: 700, fontStretch: 'normal', fontStyle: 'italic'};

const makeFont = (fontFamily, fontFile, style) => ({
  ...style,
  fontFamily,
  src: `url('${fontFile}') format('woff2')`
});


const karla = makeFont('Karla', karlaWoff2, fontStylesRegular);
const karlaItalic = makeFont('Karla', karlaItalicWoff2, fontStylesItalic);
const karlaBold = makeFont('Karla', karlaBoldWoff2, fontStylesBold);
const karlaBoldItalic = makeFont('Karla', karalaBoldItalicWoff2, fontStylesBoldItalic);

const merriweather = makeFont('Merriweather', merriweatherWoff2, fontStylesRegular);
const merriweatherItalic = makeFont('Merriweather', merriweatherItalicWoff2, fontStylesItalic);
const merriweatherBold = makeFont('Merriweather', merriweatherBoldWoff2, fontStylesBold);
const merriweatherBoldItalic = makeFont('Merriweather', merriweatherBoldItalicWoff2, fontStylesBoldItalic);

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

