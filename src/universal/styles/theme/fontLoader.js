import karlaWoff2 from 'universal/styles/theme/fonts/Karla-regular.woff2';
import karlaItalicWoff2 from 'universal/styles/theme/fonts/Karla-italic.woff2';
import merriweatherWoff2 from 'universal/styles/theme/fonts/Merriweather-regular.woff2';
import merriweatherBoldWoff2 from 'universal/styles/theme/fonts/Merriweather-700.woff2';

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
const merriweather = makeFont('Merriweather', merriweatherWoff2, fontStylesRegular);
const merriweatherBold = makeFont('Merriweather', merriweatherBoldWoff2, fontStylesBold);

console.log([karla, karlaItalic]);
export default [karla, karlaItalic, merriweather, merriweatherBold];

