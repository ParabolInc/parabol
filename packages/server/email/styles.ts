import {buttonShadow} from 'parabol-client/styles/elevation'

export const emailBackgroundColor = '#F1F0FA'
export const emailBodyColor = '#FFFFFF'
export const emailFontFamily =
  '"IBM Plex Sans", -apple-system, BlinkMacSystemFont, Roboto, "Helvetica Neue", Arial, sans-serif'
export const emailFontSize = '16px'

export const emailPrimaryButtonStyle = {
  backgroundColor: '#FD6157',
  backgroundImage: 'linear-gradient(to right, #ED4C56 0, #ED4C86 100%)',
  borderRadius: '4em',
  boxShadow: buttonShadow,
  color: '#FFFFFF',
  cursor: 'pointer',
  display: 'block',
  fontFamily: emailFontFamily,
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
  color: '#444258',
  fontFamily: emailFontFamily,
  fontSize: '16px',
  fontWeight: 400,
  lineHeight: '1.5',
  margin: '0px 0px 24px',
  padding: '0px',
  textDecoration: 'none'
}

export const emailLineHeight = 1.5

export const emailLinkStyle = {
  color: '#329AE5',
  fontFamily: emailFontFamily,
  fontWeight: 600,
  textDecoration: 'none'
}

export const emailInnerMaxWidth = 536
export const emailMaxWidth = 600

export const emailRuleColor = '#DBD6E3'
export const emailRuleHeight = '1px'
export const emailRuleStyle = {
  backgroundColor: '#DBD6E3',
  border: '0px',
  height: '1px',
  margin: '0 auto'
}

export const emailProductTeamSignature = 'The Parabol Product Team 🙉 🙈 🙊'

export const emailTableBase = {
  borderCollapse: 'collapse',
  borderSpacing: '0px',
  margin: '0px auto',
  width: '100%'
} as const

export const emailTextColor = '#444258'
export const emailTextColorLight = '#82809A'

export const headCSS = `
  @media only screen and (max-width: 620px) {
    table[class=body] .maxWidthContainer {
      padding: 0 !important;
      width: 100% !important;
    }
  }
`
