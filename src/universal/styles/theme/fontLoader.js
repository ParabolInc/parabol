
// fontLoader.js

import webfontRobotoBoldWoff from 'universal/styles/theme/fonts/roboto-bold-webfont.woff';
import webfontRobotoBoldWoff2 from 'universal/styles/theme/fonts/roboto-bold-webfont.woff2';

import webfontRobotoBoldItalicWoff from 'universal/styles/theme/fonts/roboto-bolditalic-webfont.woff';
import webfontRobotoBoldItalicWoff2 from 'universal/styles/theme/fonts/roboto-bolditalic-webfont.woff2';

import webfontRobotoItalicWoff from 'universal/styles/theme/fonts/roboto-italic-webfont.woff';
import webfontRobotoItalicWoff2 from 'universal/styles/theme/fonts/roboto-italic-webfont.woff2';

import webfontRobotoRegularWoff from 'universal/styles/theme/fonts/roboto-regular-webfont.woff';
import webfontRobotoRegularWoff2 from 'universal/styles/theme/fonts/roboto-regular-webfont.woff2';

import webfontRobotoSlabBoldWoff from 'universal/styles/theme/fonts/robotoslab-bold-webfont.woff';
import webfontRobotoSlabBoldWoff2 from 'universal/styles/theme/fonts/robotoslab-bold-webfont.woff2';

import webfontRobotoSlabLightWoff from 'universal/styles/theme/fonts/robotoslab-light-webfont.woff';
import webfontRobotoSlabLightWoff2 from 'universal/styles/theme/fonts/robotoslab-light-webfont.woff2';

import webfontRobotoSlabRegularWoff from 'universal/styles/theme/fonts/robotoslab-regular-webfont.woff';
import webfontRobotoSlabRegularWoff2 from 'universal/styles/theme/fonts/robotoslab-regular-webfont.woff2';

const fontStylesRegular = {fontWeight: 400, fontStretch: 'normal', fontStyle: 'normal'};
const fontStylesItalic = {fontWeight: 400, fontStretch: 'normal', fontStyle: 'italic'};
const fontStylesLight = {fontWeight: 300, fontStretch: 'normal', fontStyle: 'normal'};
const fontStylesBold = {fontWeight: 700, fontStretch: 'normal', fontStyle: 'normal'};
const fontStylesBoldItalic = {fontWeight: 700, fontStretch: 'normal', fontStyle: 'italic'};

const makeFont = (fontFamily, woff2File, woffFile, style) => ({
  ...style,
  fontFamily,
  src: `url('${woff2File}') format('woff2'), url('${woffFile}') format('woff')`
});


const robotoBold = makeFont('Roboto', webfontRobotoBoldWoff2, webfontRobotoBoldWoff, fontStylesBold);
const robotoBoldItalic = makeFont('Roboto', webfontRobotoBoldItalicWoff2, webfontRobotoBoldItalicWoff, fontStylesBoldItalic);
const robotoItalic = makeFont('Roboto', webfontRobotoItalicWoff2, webfontRobotoItalicWoff, fontStylesItalic);
const robotoRegular = makeFont('Roboto', webfontRobotoRegularWoff2, webfontRobotoRegularWoff, fontStylesRegular);

const robotoSlabBold = makeFont('Roboto Slab', webfontRobotoSlabBoldWoff2, webfontRobotoSlabBoldWoff, fontStylesBold);
const robotoSlabLight = makeFont('Roboto Slab', webfontRobotoSlabLightWoff2, webfontRobotoSlabLightWoff, fontStylesLight);
const robotoSlabRegular = makeFont('Roboto Slab', webfontRobotoSlabRegularWoff2, webfontRobotoSlabRegularWoff, fontStylesRegular);

export default [
  robotoBold,
  robotoBoldItalic,
  robotoItalic,
  robotoRegular,
  robotoSlabBold,
  robotoSlabLight,
  robotoSlabRegular
];
