import PropTypes from 'prop-types'
import React from 'react'
import EmptySpace from '../EmptySpace/EmptySpace'
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
    fontSize: `${props.fontSize}px`,
    lineHeight: `${props.lineHeight}`,
    padding: `${props.padding}px`,
    textAlign: 'center'
  }

  const textStyle = {
    fontFamily: emailFontFamily
  }

  const meetingDateStyle = {
    ...textStyle,
    color: appTheme.brand.primary.midGray,
    fontSize: '16px',
    fontWeight: 400,
    lineHeight: '24px'
  }

  const teamNameStyle = {
    ...textStyle,
    fontSize: '36px',
    fontWeight: 600
  }
  const meetingDate = makeDateString(createdAt, {showDay: true})

  const labelStyles = {
    color: appTheme.palette.dark70l,
    fontSize: '13px',
    fontWeight: 600,
    padding: '0px 0px 16px',
    textAlign: 'center',
    textTransform: 'uppercase'
  }

  return (
    <div style={{padding: '0px 16px'}}>
      <EmptySpace height={props.vSpacing} />
      <table width={props.width}>
        <tbody>
          <tr>
            <td style={blockStyle}>
              <div style={labelStyles}>{'Meeting Summary'}</div>
              <div style={teamNameStyle}>{teamName}</div>
              <div style={meetingDateStyle}>
                {!isDemo && `${meetingLabel} Meeting #${meetingNumber}`}
                {!isDemo && ' • '}
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
  fontSize: PropTypes.number,
  isDemo: PropTypes.boolean,
  lineHeight: PropTypes.number,
  meetingNumber: PropTypes.number,
  meetingType: PropTypes.string,
  padding: PropTypes.number,
  teamName: PropTypes.string,
  vSpacing: PropTypes.number,
  width: PropTypes.string
}

SummaryHeader.defaultProps = {
  fontSize: 24,
  lineHeight: 1.5,
  padding: 24,
  vSpacing: 16,
  width: '100%'
}

export default SummaryHeader
