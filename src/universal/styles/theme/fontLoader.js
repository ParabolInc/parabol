// releases: https://github.com/IBM/plex/releases
// currently using: Web.zip from https://github.com/IBM/plex/releases/tag/v1.0.1

import plexMonoRegularWoff2 from 'universal/styles/theme/fonts/IBMPlexMono-Regular.woff2'
import plexMonoSemiBoldWoff2 from 'universal/styles/theme/fonts/IBMPlexMono-SemiBold.woff2'
import plexSansItalicWoff2 from 'universal/styles/theme/fonts/IBMPlexSans-Italic.woff2'
import plexSansRegularWoff2 from 'universal/styles/theme/fonts/IBMPlexSans-Regular.woff2'
import plexSansSemiBoldWoff2 from 'universal/styles/theme/fonts/IBMPlexSans-SemiBold.woff2'
import plexSansSemiBoldItalicWoff2 from 'universal/styles/theme/fonts/IBMPlexSans-SemiBoldItalic.woff2'
import materialIconsRegularWoff2 from 'universal/styles/theme/fonts/MaterialIcons-Regular.woff2'

const fontStylesRegular = {
  fontWeight: 400,
  fontStretch: 'normal',
  fontStyle: 'normal'
}
const fontStylesItalic = {
  fontWeight: 400,
  fontStretch: 'normal',
  fontStyle: 'italic'
}
const fontStylesSemiBold = {
  fontWeight: 600,
  fontStretch: 'normal',
  fontStyle: 'normal'
}
const fontStylesSemiBoldItalic = {
  fontWeight: 600,
  fontStretch: 'normal',
  fontStyle: 'italic'
}

const makeFont = (fontFamily, woff2File, style) => ({
  ...style,
  fontFamily,
  src: `url('${woff2File}') format('woff2')`
})

const plexMonoRegular = makeFont('IBM Plex Mono', plexMonoRegularWoff2, fontStylesRegular)
const plexMonoSemiBold = makeFont('IBM Plex Mono', plexMonoSemiBoldWoff2, fontStylesSemiBold)

const plexSansItalic = makeFont('IBM Plex Sans', plexSansItalicWoff2, fontStylesItalic)
const plexSansRegular = makeFont('IBM Plex Sans', plexSansRegularWoff2, fontStylesRegular)
const plexSansSemiBold = makeFont('IBM Plex Sans', plexSansSemiBoldWoff2, fontStylesSemiBold)
const plexSansSemiBoldItalic = makeFont(
  'IBM Plex Sans',
  plexSansSemiBoldItalicWoff2,
  fontStylesSemiBoldItalic
)

const materialIconsRegular = {
  fontFamily: 'Material Icons',
  fontStyle: 'normal',
  fontWeight: '400',
  src: `local('Material Icons'), local('MaterialIcons-Regular'), url(${materialIconsRegularWoff2}) format('woff2')`
}

export default [
  plexMonoRegular,
  plexMonoSemiBold,
  plexSansItalic,
  plexSansRegular,
  plexSansSemiBold,
  plexSansSemiBoldItalic,
  materialIconsRegular
]
