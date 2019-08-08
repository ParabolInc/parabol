import React from 'react'
import appTheme from '../../../../styles/theme/appTheme'
import {emailFontFamily, emailPrimaryButtonStyle, emailTableBase} from '../../../../styles/email'
import emailDir from '../../emailDir'
import EmailBorderBottom from '../SummaryEmail/MeetingSummaryEmail/EmailBorderBottom'

const tableStyle = {
  ...emailTableBase,
  width: '100%'
} as React.CSSProperties

const textStyle = {
  color: appTheme.palette.dark,
  fontFamily: emailFontFamily
} as React.CSSProperties
const headingStyle = {
  ...textStyle,
  fontSize: 24,
  fontWeight: 600,
  paddingTop: 24
} as React.CSSProperties
const copyStyle = {
  ...textStyle,
  fontSize: 16,
  paddingTop: 4
} as React.CSSProperties
const subHeadingStyle = {
  ...textStyle,
  fontWeight: 600,
  fontSize: 16,
  paddingTop: 24
} as React.CSSProperties

const primaryButtonStyle = {
  ...emailPrimaryButtonStyle,
  width: '320px'
} as React.CSSProperties
const iconSize = 40
const labelWidth = 298
const featureWidth = iconSize + labelWidth
const featureTableStyle = {
  ...tableStyle,
  width: featureWidth
} as React.CSSProperties
const featureIconCellStyle = {
  height: iconSize,
  padding: '6px 0',
  width: iconSize
} as React.CSSProperties
const featureIconStyle = {
  display: 'block',
  height: iconSize,
  width: iconSize
} as React.CSSProperties
const featureCopyCellStyle = {
  fontSize: 16,
  height: iconSize,
  padding: '6px 0 6px 18px',
  textAlign: 'left',
  width: 280
} as React.CSSProperties

const buttonCellStyle = {
  paddingTop: 24
} as React.CSSProperties

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
        <img crossOrigin='' height={iconSize} src={src} style={featureIconStyle} width={iconSize} />
      </td>
      <td style={featureCopyCellStyle} width={labelWidth}>
        {featureCopy}
      </td>
    </tr>
  )
}

const CreateAccountSection = (props) => {
  const {isDemo} = props
  if (!isDemo) return null
  return (
    <>
      <tr>
        <td style={headingStyle} align='center'>
          {'Thanks for playing!'}
        </td>
      </tr>
      <tr>
        <td align='center' style={copyStyle}>
          In just a few seconds you’ll have access
        </td>
      </tr>
      <tr>
        <td align='center' style={copyStyle}>
          <span>
            to run <b>unlimited retrospectives</b> with your team.
          </span>
        </td>
      </tr>
      <tr>
        <td style={buttonCellStyle}>
          <a href={primaryActionLink} style={primaryButtonStyle} title={primaryActionLabel}>
            {primaryActionLabel}
          </a>
        </td>
      </tr>
      <tr>
        <td align='center' style={subHeadingStyle}>
          {'The Parabol Difference'}
        </td>
      </tr>
      <tr>
        <td>
          <table style={featureTableStyle} width={featureWidth}>
            <tbody>{features.map(({icon, copy}, idx) => makeFeatureRow(icon, copy, idx))}</tbody>
          </table>
        </td>
      </tr>
      <EmailBorderBottom />
    </>
  )
}

export default CreateAccountSection
