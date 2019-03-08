import React from 'react'
import EmptySpace from '../EmptySpace/EmptySpace'
import appTheme from 'universal/styles/theme/appTheme'
import {emailFontFamily, emailPrimaryButtonStyle, emailTableBase} from 'universal/styles/email'
import emailDir from 'universal/modules/email/emailDir'

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
  fontWeight: 600,
  margin: '0 0 16px'
}
const copyStyle = {
  ...textStyle,
  fontSize: 16,
  margin: '0 0 24px'
}
const subHeadingStyle = {
  ...textStyle,
  fontWeight: 600,
  fontSize: 16,
  margin: '48px 0 16px'
}
const primaryButtonStyle = {
  ...emailPrimaryButtonStyle,
  width: '320px'
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
  padding: '6px 0',
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
  padding: '6px 0 6px 18px',
  textAlign: 'left',
  width: 280
}

const features = [
  {icon: 'feature-prompts@3x.png', copy: 'Custom retrospective formats'},
  {icon: 'feature-grouping@3x.png', copy: 'Realtime group participation'},
  {icon: 'feature-summary@3x.png', copy: 'Detailed meeting summary email'},
  {icon: 'feature-owners@3x.png', copy: 'Takeaway tasks with owners'}
]
const primaryActionLabel = 'Create a Free Account'
const primaryActionLink = '/create-account?from=demo'

const makeFeatureRow = (featureIconFile, featureCopy, idx) => {
  const src = `${emailDir}${featureIconFile}`
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
      <table style={tableStyle} width="100%">
        <tbody>
          <tr>
            <td style={blockStyle}>
              <div style={headingStyle}>Thanks for playing!</div>
              <div style={copyStyle}>
                In just a few seconds you’ll have access
                <br />
                to run <b>unlimited retrospectives</b> with your team.
              </div>
              <div>
                <a href={primaryActionLink} style={primaryButtonStyle} title={primaryActionLabel}>
                  {primaryActionLabel}
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
