import React from 'react'
import EmptySpace from '../EmptySpace/EmptySpace'
import appTheme from 'universal/styles/theme/appTheme'
import {
  emailFontFamily,
  emailLinkStyle,
  emailPrimaryButtonStyle,
  emailTableBase
} from 'universal/styles/email'

const tableStyle = {
  ...emailTableBase,
  width: '100%'
}
const blockStyle = {
  backgroundColor: '#fff',
  color: appTheme.palette.dark,
  fontFamily: emailFontFamily,
  fontSize: '24px',
  lineHeight: 1.5,
  padding: '0 20px',
  textAlign: 'center'
}
const textStyle = {
  color: appTheme.palette.dark,
  fontFamily: emailFontFamily
}
const headingStyle = {
  ...textStyle,
  fontSize: 24,
  margin: '0 0 8px'
}
const copyStyle = {
  ...textStyle,
  fontSize: 14,
  margin: '0 0 20px'
}
const subHeadingStyle = {
  ...textStyle,
  fontSize: 16,
  fontStyle: 'italic',
  fontWeight: 600,
  margin: '0 0 16px'
}
const primaryButtonStyle = {
  ...emailPrimaryButtonStyle,
  width: '320px'
}
const linkStyle = {
  ...emailLinkStyle,
  display: 'block',
  fontSize: 14,
  margin: '20px 0 32px'
}
const iconSize = 40
const labelWidth = 298
const featureWidth = iconSize + labelWidth
const featureTableStyle = {
  ...tableStyle,
  width: featureWidth
}
const featureIconCellStyle = {
  height: iconSize,
  padding: '8px 0',
  width: iconSize
}
const featureIconStyle = {
  display: 'block',
  height: iconSize,
  width: iconSize
}
const featureCopyCellStyle = {
  fontSize: 16,
  height: iconSize,
  padding: '8px 0 8px 18px',
  textAlign: 'left',
  width: 280
}

const features = [
  {icon: 'prompts@3x.png', copy: 'Custom retrospective formats'},
  {icon: 'grouping@3x.png', copy: 'Engaging UX for 8+ team members'},
  {icon: 'summary@3x.png', copy: 'Detailed meeting summary email'},
  {icon: 'owners@3x.png', copy: 'Takeaway tasks with owners'}
]
const primaryActionLabel = 'Invite Your Team'
const primaryActionLink = '/create-account?from=demo'

const makeFeatureRow = (featureIconFile, featureCopy, idx) => {
  const src = `/static/images/email/icons/${featureIconFile}`
  return (
    <tr key={`feature${idx}`}>
      <td style={featureIconCellStyle} width={iconSize}>
        <img height={iconSize} src={src} style={featureIconStyle} width={iconSize} />
      </td>
      <td style={featureCopyCellStyle} width={labelWidth}>
        {featureCopy}
      </td>
    </tr>
  )
}

const CreateAccountSection = () => {
  return (
    <div style={{padding: '0 16px'}}>
      <EmptySpace height={32} />
      <table style={tableStyle} width='100%'>
        <tbody>
          <tr>
            <td style={blockStyle}>
              <div style={headingStyle}>Thanks for playing!</div>
              <div style={copyStyle}>Retrospectives are more fun with humans.</div>
              <div>
                <a href={primaryActionLink} style={primaryButtonStyle} title={primaryActionLabel}>
                  {primaryActionLabel}
                </a>
              </div>
              <div>
                <a href='mailto:love@parabol.co?subject=Retro Demo' style={linkStyle}>
                  Still have questions? Contact us
                </a>
              </div>
              <div style={subHeadingStyle}>The Parabol Difference</div>
              <table style={featureTableStyle} width={featureWidth}>
                <tbody>
                  {features.map(({icon, copy}, idx) => makeFeatureRow(icon, copy, idx))}
                </tbody>
              </table>
            </td>
          </tr>
        </tbody>
      </table>
      <EmptySpace height={32} />
    </div>
  )
}

export default CreateAccountSection
