import PropTypes from 'prop-types'
import React, {Fragment} from 'react'
import appTheme from 'universal/styles/theme/appTheme'
import {emailBodyColor, emailFontFamily} from 'universal/styles/email'
import makeDateString from 'universal/utils/makeDateString'
import {meetingTypeToLabel} from 'universal/utils/meetings/lookups'

const SummaryHeader = (props) => {
  const {createdAt, isDemo, meetingNumber, meetingType, teamName} = props
  const meetingLabel = meetingTypeToLabel[meetingType]
  const blockStyle = {
    backgroundColor: emailBodyColor,
    color: appTheme.palette.dark,
    fontFamily: emailFontFamily,
    fontSize: '24px',
    lineHeight: 1.5,
    padding: '24px',
    textAlign: 'center'
  }

  const textStyle = {
    fontFamily: emailFontFamily
  }

  const meetingDateStyle = {
    ...textStyle,
    color: appTheme.brand.primary.midGray,
    fontSize: '15px',
    fontWeight: 400,
    lineHeight: '22px'
  }

  const teamNameStyle = {
    ...textStyle,
    fontSize: '36px',
    fontWeight: 600,
    lineHeight: '44px',
    margin: '0px 0px 4px'
  }
  const meetingDate = makeDateString(createdAt, {showDay: true})

  const labelStyles = {
    color: appTheme.palette.dark70l,
    fontSize: '12px',
    fontWeight: 600,
    lineHeight: '16px',
    padding: '12px 0px 10px',
    textAlign: 'center',
    textTransform: 'uppercase'
  }

  const logoStyle = {
    display: 'block',
    margin: '0 auto'
  }

  return (
    <div style={{padding: '0px 16px'}}>
      <table width='100%'>
        <tbody>
          <tr>
            <td style={blockStyle}>
              <img
                src='/static/images/brand/mark-purple@3x.png'
                style={logoStyle}
                height='28'
                width='31'
              />
              <div style={labelStyles}>{'Meeting Summary'}</div>
              <div style={teamNameStyle}>{teamName}</div>
              <div style={meetingDateStyle}>
                {!isDemo && (
                  <Fragment>
                    {`${meetingLabel} Meeting #${meetingNumber}`}
                    {' • '}
                  </Fragment>
                )}
                {meetingDate}
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

SummaryHeader.propTypes = {
  children: PropTypes.any,
  createdAt: PropTypes.oneOfType([
    PropTypes.string,
    // this comes from SSR
    PropTypes.instanceOf(Date)
  ]),
  isDemo: PropTypes.bool,
  meetingNumber: PropTypes.number,
  meetingType: PropTypes.string,
  teamName: PropTypes.string
}

export default SummaryHeader
