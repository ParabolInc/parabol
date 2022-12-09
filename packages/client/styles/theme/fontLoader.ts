// releases: https://github.com/IBM/plex/releases
// currently using: Web.zip from https://github.com/IBM/plex/releases/tag/v1.0.1
// Material Design Icons font: https://google.github.io/material-design-icons/#icon-font-for-the-web

import plexMonoRegularWoff2 from './fonts/IBMPlexMono-Regular.woff2'
import plexMonoSemiBoldWoff2 from './fonts/IBMPlexMono-SemiBold.woff2'
import plexSansItalicWoff2 from './fonts/IBMPlexSans-Italic.woff2'
import plexSansRegularWoff2 from './fonts/IBMPlexSans-Regular.woff2'
import plexSansSemiBoldWoff2 from './fonts/IBMPlexSans-SemiBold.woff2'
import plexSansSemiBoldItalicWoff2 from './fonts/IBMPlexSans-SemiBoldItalic.woff2'

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

const makeFont = (fontFamily: string, woff2File: any, style: any) => ({
  ...style,
  fontDisplay: 'swap',
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

export default [
  plexMonoRegular,
  plexMonoSemiBold,
  plexSansItalic,
  plexSansRegular,
  plexSansSemiBold,
  plexSansSemiBoldItalic
]
