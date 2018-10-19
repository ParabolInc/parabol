import PropTypes from 'prop-types'
import React from 'react'
import EmptySpace from '../EmptySpace/EmptySpace'
// import {Link} from 'react-router-dom'
import appTheme from 'universal/styles/theme/appTheme'
import ui from 'universal/styles/ui'
import {emailPrimaryButtonStyle, emailLinkStyle} from 'universal/styles/emails'

const CreateAccountSection = (props) => {
  const {referrer} = props
  console.log(`referrer: ${referrer}`)
  const tableStyle = {
    ...ui.emailTableBase,
    width: '100%'
  }
  const blockStyle = {
    backgroundColor: '#fff',
    color: appTheme.palette.dark,
    fontFamily: ui.emailFontFamily,
    fontSize: '24px',
    lineHeight: 1.5,
    padding: '0 20px',
    textAlign: 'center'
  }
  const textStyle = {
    color: appTheme.palette.dark,
    fontFamily: ui.emailFontFamily
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
  const featureTableStyle = {
    ...tableStyle,
    width: 298
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
    width: 240
  }
  const makeFeatureRow = (featureIconFile, featureCopy, idx) => {
    const src = `/static/images/email/icons/${featureIconFile}`
    return (
      <tr key={`feature${idx}`}>
        <td style={featureIconCellStyle}>
          <img height={iconSize} src={src} style={featureIconStyle} width={iconSize} />
        </td>
        <td style={featureCopyCellStyle}>{featureCopy}</td>
      </tr>
    )
  }
  const features = [
    {icon: 'prompts@3x.png', copy: 'Custom retrospective formats'},
    {icon: 'grouping@3x.png', copy: 'Multiplayer grouping and voting'},
    {icon: 'summary@3x.png', copy: 'A detailed meeting summary'},
    {icon: 'owners@3x.png', copy: 'Takeaway tasks with owners'},
    {icon: 'integrations@3x.png', copy: 'Integrates with Slack and more'}
  ]
  const primaryActionLabel = 'Create a Free Account'
  const primaryActionLink = '/create-account'
  return (
    <div style={{padding: '0 16px'}}>
      <EmptySpace height={32} />
      <table style={tableStyle} width='100%'>
        <tbody>
          <tr>
            <td style={blockStyle}>
              <div style={headingStyle}>How was the demo?</div>
              <div style={copyStyle}>
                Try running your team’s next retrospective using Parabol for free:
              </div>
              <div>
                <a href={primaryActionLink} style={primaryButtonStyle} title={primaryActionLabel}>
                  {primaryActionLabel}
                </a>
                {/* {referrer === 'email' ? (
                  <a href={primaryActionLink} style={primaryButtonStyle} title={primaryActionLabel}>
                    {primaryActionLabel}
                  </a>
                ) : (
                  <Link to={primaryActionLink} style={primaryButtonStyle} title={primaryActionLabel}>
                    {primaryActionLabel}
                  </Link>
                )} */}
              </div>
              <div>
                <a
                  href='mailto:love@parabol.co?subject=Feedback for Parabol Retro Demo'
                  style={linkStyle}
                >
                  Or, tell us what you liked and didn’t like
                </a>
              </div>
              <div style={subHeadingStyle}>What folks say they like about Parabol Retros…</div>
              <table style={featureTableStyle} width='298'>
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

CreateAccountSection.propTypes = {
  referrer: PropTypes.oneOf(['meeting', 'email', 'history'])
}

export default CreateAccountSection
