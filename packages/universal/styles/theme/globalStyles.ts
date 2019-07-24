import {makePlaceholderStylesString} from '../helpers/makePlaceholderStyles'
import appTheme from './appTheme'
import fontLoader from './fontLoader'
import ui from '../ui'
import {FONT_FAMILY} from '../typographyV2'
import {PALETTE} from '../paletteV2'

const placeholderStyles = makePlaceholderStylesString(ui.placeholderColor)

const fontFaceDefinitions = fontLoader
  .map(
    (fontFace) => `
    @font-face {
      font-family: "${fontFace.fontFamily}";
      src: ${fontFace.src};
      font-style: ${fontFace.fontStyle};
      font-weight: ${fontFace.fontWeight};
      font-stretch: ${fontFace.fontStretch};
    }
  `
  )
  .join('\n')

const draftStyles = `
  .draft-blockquote {
    font-style: italic;
    border-left: 2px #49327266 solid;
    margin 8px 0;
    padding 0 8px;
  }
  
  .draft-codeblock {
    background-color: ${PALETTE.BACKGROUND_MAIN};
    border-left: 2px #49327266 solid;
    border-radius: 1px;
    font-family: ${FONT_FAMILY.MONOSPACE};
    font-size: 13px;
    line-height: 1.5;
    margin: 0;
    padding: 0 8px;
  }
`

export default `
  * {
    box-sizing: border-box;
  }

  *::before, *::after {
    box-sizing: border-box;
  }

  html {
    font-size: 16px;
  }

  body {
    color: ${ui.colorText};
    font-family: ${appTheme.typography.sansSerif};
    -moz-osx-font-smoothing: grayscale;
    -webkit-font-smoothing: antialiased;
    font-size: 16px;
    font-weight: 400;
    line-height: normal;
    margin: 0;
    padding: 0;
  }

  a {
    color: ${ui.linkColor};
    text-decoration: none;
  }

  a:hover, a:focus {
    color: ${ui.linkColorHover};
    text-decoration: none;
  }

  input {
    font-family: ${appTheme.typography.sansSerif};
    -moz-osx-font-smoothing: grayscale;
    -webkit-font-smoothing: antialiased;
  }

  textarea {
    font-family: ${appTheme.typography.sansSerif};
    -moz-osx-font-smoothing: grayscale;
    -webkit-font-smoothing: antialiased;
  }
  img {
    max-width: 100%;
  }

  p {
    margin: 0;
  }

  pre {
    max-width: 100%;
    overflow: auto;
  }

  b {
    font-weight: 600;
  }

  strong {
    font-weight: 600;
  }

  /*::-webkit-scrollbar {
    -webkit-appearance: none;
    width:6px;
  }

  ::-webkit-scrollbar-thumb {
    border-radius:3px;
    background-color:rgba(0, 0, 0, 0.3);
  }

  ::-webkit-scrollbar-thumb:hover {
    background:rgba(0, 0, 0, 0.5);
  }

  ::-webkit-scrollbar-thumb:window-inactive {
    background:rgba(0, 0, 0, 0.2);
  }*/

  @media print {
    html,
    body {
      font-size: 14px !important;
    }
    .hide-print {
      display: none !important;
    }
  }
  
  ${draftStyles}

  ${placeholderStyles}

  ${fontFaceDefinitions}
`
