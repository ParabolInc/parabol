import emailDir from '../../../emailDir'
import React from 'react'
import {FONT_FAMILY, PALETTE_TEXT_LIGHT, PALETTE_TEXT_MAIN} from './constants'
import {meetingTypeToLabel} from '../../../../../utils/meetings/lookups'
import makeDateString from '../../../../../utils/makeDateString'
import {createFragmentContainer, graphql} from 'react-relay'
import {SummaryHeader_meeting} from '../../../../../../__generated__/SummaryHeader_meeting.graphql'

const meetingSummaryLabel = {
  color: PALETTE_TEXT_LIGHT,
  fontFamily: FONT_FAMILY,
  textTransform: 'uppercase',
  fontSize: '12px',
  fontWeight: 600,
  paddingTop: 8,
  textAlign: 'center'
} as React.CSSProperties

const teamNameLabel = {
  color: PALETTE_TEXT_MAIN,
  fontFamily: FONT_FAMILY,
  fontSize: 36,
  fontWeight: 600,
  paddingTop: 16
} as React.CSSProperties

const dateLabel = {
  color: PALETTE_TEXT_LIGHT,
  fontFamily: FONT_FAMILY,
  fontSize: '15px',
  fontWeight: 400,
  paddingTop: 8
} as React.CSSProperties

interface Props {
  meeting: SummaryHeader_meeting
  isDemo?: boolean
}

const SummaryHeader = (props: Props) => {
  const {meeting, isDemo} = props
  const {
    createdAt,
    meetingNumber,
    meetingType,
    team: {name: teamName}
  } = meeting
  const meetingDate = makeDateString(createdAt, {showDay: true})
  const meetingLabel = meetingTypeToLabel[meetingType]
  return (
    <table align='center' width='100%'>
      <tbody>
        <tr>
          <td align='center' style={{paddingTop: 16}}>
            <img alt='Parabol Logo' src={`${emailDir}mark-purple@3x.png`} height='28' width='31' />
          </td>
        </tr>
        <tr>
          <td align='center' style={meetingSummaryLabel}>
            {'Meeting Summary'}
          </td>
        </tr>
        <tr>
          <td align='center' style={teamNameLabel}>
            {teamName}
          </td>
        </tr>
        <tr>
          <td align='center' style={dateLabel}>
            {isDemo ? meetingDate : `${meetingLabel} Meeting #${meetingNumber} • ${meetingDate}`}
          </td>
        </tr>
      </tbody>
    </table>
  )
}

export default createFragmentContainer(SummaryHeader, {
  meeting: graphql`
    fragment SummaryHeader_meeting on NewMeeting {
      createdAt
      meetingNumber
      meetingType
      team {
        name
      }
    }
  `
})
