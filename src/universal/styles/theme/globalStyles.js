import {makePlaceholderStylesString} from 'universal/styles/helpers/makePlaceholderStyles'
import appTheme from 'universal/styles/theme/appTheme'
import fontLoader from 'universal/styles/theme/fontLoader'
import ui from 'universal/styles/ui'

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

  ${placeholderStyles}

  ${fontFaceDefinitions}
`
