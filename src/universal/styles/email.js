// styles/email.js

import ui from 'universal/styles/ui'
import {buttonShadow} from 'universal/styles/elevation'

export const emailBackgroundColor = ui.palette.light
export const emailFontFamily =
  '"IBM Plex Sans", -apple-system, BlinkMacSystemFont, Roboto, "Helvetica Neue", Arial, sans-serif'
export const emailFontSize = '16px'

export const emailPrimaryButtonStyle = {
  backgroundColor: ui.palette.warm,
  backgroundImage: ui.gradientWarm,
  borderRadius: '4em',
  boxShadow: buttonShadow,
  color: '#FFFFFF',
  cursor: 'pointer',
  display: 'block',
  fontFamily: ui.emailFontFamily,
  fontSize: '16px',
  fontWeight: 600,
  lineHeight: '1.5',
  margin: '0px auto',
  padding: '10px 0px',
  textAlign: 'center',
  textDecoration: 'none',
  width: '128px'
}

export const emailCopyStyle = {
  color: ui.palette.dark,
  fontFamily: ui.emailFontFamily,
  fontSize: '16px',
  fontWeight: 400,
  lineHeight: '1.5',
  margin: '0px 0px 24px',
  padding: 0,
  textDecoration: 'none'
}

export const emailLineHeight = 1.5

export const emailLinkStyle = {
  color: ui.palette.blue,
  fontFamily: ui.emailFontFamily,
  textDecoration: 'underline'
}

export const emailInnerMaxWidth = 536
export const emailMaxWidth = 600

export const emailTableBase = {
  borderCollapse: 'collapse',
  borderSpacing: '0px',
  margin: '0px auto'
}

export const emailTextColor = ui.palette.dark
export const emailTextColorLight = ui.palette.midGray

export const headCSS = `
  @media only screen and (max-width: 620px) {
    table[class=body] .maxWidthContainer {
      padding: 0 !important;
      width: 100% !important;
    }
  }
`
