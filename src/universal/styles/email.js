// styles/email.js

import ui from 'universal/styles/ui'
import {buttonShadow} from 'universal/styles/elevation'

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
  margin: '0 auto',
  padding: '10px 0',
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
  margin: '0 0 24px',
  padding: 0,
  textDecoration: 'none'
}

export const emailLinkStyle = {
  color: ui.palette.blue,
  fontFamily: ui.emailFontFamily,
  textDecoration: 'underline'
}

export const headCSS = `
  table[class=body] .responsiveEmailTest {
    color: red !important;
  }
  @media only screen and (max-width: 620px) {
    table[class=body] .container {
      padding: 0 !important;
      width: 100% !important;
    }

    table[class=body] .responsiveEmailTest {
      color: green !important;
    }
  }
`
