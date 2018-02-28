
// releases: https://github.com/IBM/plex/releases
// currently using: Web.zip from https://github.com/IBM/plex/releases/tag/v1.0.1

import plexMonoRegularWoff2 from 'universal/styles/theme/fonts/IBMPlexMono-Regular.woff2';
import plexMonoSemiBoldWoff2 from 'universal/styles/theme/fonts/IBMPlexMono-SemiBold.woff2';
import plexSansItalicWoff2 from 'universal/styles/theme/fonts/IBMPlexSans-Italic.woff2';
import plexSansRegularWoff2 from 'universal/styles/theme/fonts/IBMPlexSans-Regular.woff2';
import plexSansSemiBoldWoff2 from 'universal/styles/theme/fonts/IBMPlexSans-SemiBold.woff2';
import plexSansSemiBoldItalicWoff2 from 'universal/styles/theme/fonts/IBMPlexSans-SemiBoldItalic.woff2';
import plexSerifSemiBoldWoff2 from 'universal/styles/theme/fonts/IBMPlexSerif-SemiBold.woff2';
import plexSerifSemiBoldItalicWoff2 from 'universal/styles/theme/fonts/IBMPlexSerif-SemiBoldItalic.woff2';

const fontStylesRegular = {fontWeight: 400, fontStretch: 'normal', fontStyle: 'normal'};
const fontStylesItalic = {fontWeight: 400, fontStretch: 'normal', fontStyle: 'italic'};
const fontStylesSemiBold = {fontWeight: 600, fontStretch: 'normal', fontStyle: 'normal'};
const fontStylesSemiBoldItalic = {fontWeight: 600, fontStretch: 'normal', fontStyle: 'italic'};

const makeFont = (fontFamily, woffFile, style) => ({
  ...style,
  fontFamily,
  src: `url('${woffFile}') format('woff2')`
});


const plexMonoRegular = makeFont('IBM Plex Mono', plexMonoRegularWoff2, fontStylesRegular);
const plexMonoSemiBold = makeFont('IBM Plex Mono', plexMonoSemiBoldWoff2, fontStylesSemiBold);

const plexSansItalic = makeFont('IBM Plex Sans', plexSansItalicWoff2, fontStylesItalic);
const plexSansRegular = makeFont('IBM Plex Sans', plexSansRegularWoff2, fontStylesRegular);
const plexSansSemiBold = makeFont('IBM Plex Sans', plexSansSemiBoldWoff2, fontStylesSemiBold);
const plexSansSemiBoldItalic = makeFont('IBM Plex Sans', plexSansSemiBoldItalicWoff2, fontStylesSemiBoldItalic);

const plexSerifSemiBold = makeFont('IBM Plex Serif', plexSerifSemiBoldWoff2, fontStylesSemiBold);
const plexSerifSemiBoldItalic = makeFont('IBM Plex Serif', plexSerifSemiBoldItalicWoff2, fontStylesSemiBoldItalic);

export default [
  plexMonoRegular,
  plexMonoSemiBold,
  plexSansItalic,
  plexSansRegular,
  plexSansSemiBold,
  plexSansSemiBoldItalic,
  plexSerifSemiBold,
  plexSerifSemiBoldItalic
];
