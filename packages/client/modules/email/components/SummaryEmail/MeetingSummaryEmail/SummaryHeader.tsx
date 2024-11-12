import graphql from 'babel-plugin-relay/macro'
import {SummaryHeader_meeting$key} from 'parabol-client/__generated__/SummaryHeader_meeting.graphql'
import {PALETTE} from 'parabol-client/styles/paletteV3'
import {FONT_FAMILY} from 'parabol-client/styles/typographyV2'
import makeDateString from 'parabol-client/utils/makeDateString'
import * as React from 'react'
import {useFragment} from 'react-relay'
import {ExternalLinks} from '../../../../../types/constEnums'
import {CorsOptions} from '../../../../../types/cors'

const meetingSummaryLabel: React.CSSProperties = {
  color: PALETTE.SLATE_600,
  fontFamily: FONT_FAMILY.SANS_SERIF,
  textTransform: 'uppercase',
  fontSize: '12px',
  fontWeight: 600,
  paddingTop: 8,
  textAlign: 'center'
}

const teamNameLabel: React.CSSProperties = {
  color: PALETTE.SLATE_700,
  fontFamily: FONT_FAMILY.SANS_SERIF,
  fontSize: 36,
  fontWeight: 600,
  paddingTop: 16
}

const dateLabel: React.CSSProperties = {
  color: PALETTE.SLATE_600,
  fontFamily: FONT_FAMILY.SANS_SERIF,
  fontSize: '15px',
  fontWeight: 400,
  paddingTop: 8
}

const teamLink: React.CSSProperties = {
  color: PALETTE.SKY_500,
  fontFamily: FONT_FAMILY.SANS_SERIF,
  fontWeight: 600,
  fontSize: '15px',
  paddingTop: 8
}

const meetingLink: React.CSSProperties = {
  textDecoration: 'underline',
  color: 'inherit'
}

interface Props {
  meeting: SummaryHeader_meeting$key
  isDemo?: boolean
  corsOptions: CorsOptions
  teamDashUrl: string
  meetingUrl: string
}

const SummaryHeader = (props: Props) => {
  const {meeting: meetingRef, isDemo, corsOptions, teamDashUrl, meetingUrl} = props
  const meeting = useFragment(
    graphql`
      fragment SummaryHeader_meeting on NewMeeting {
        createdAt
        name
        team {
          name
        }
      }
    `,
    meetingRef
  )
  const {createdAt, name: meetingName, team} = meeting
  const {name: teamName} = team
  const meetingDate = makeDateString(createdAt, {showDay: true})
  return (
    <table align='center' width='100%'>
      <tbody>
        <tr>
          <td align='center' style={{paddingTop: 16}}>
            <img
              alt='Parabol Logo'
              src={`${ExternalLinks.EMAIL_CDN}mark-color@3x.png`}
              height='32'
              width='34'
              {...corsOptions}
            />
          </td>
        </tr>
        <tr>
          <td align='center' style={meetingSummaryLabel}>
            {'Meeting Summary'}
          </td>
        </tr>
        <tr>
          <td align='center' style={teamNameLabel}>
            <a href={meetingUrl} style={meetingLink} rel='noopener noreferrer'>
              {meetingName}
            </a>
          </td>
        </tr>
        <tr>
          <td align='center' style={dateLabel}>
            {isDemo ? (
              meetingDate
            ) : (
              <>
                <a style={teamLink} href={teamDashUrl} rel='noopener noreferrer'>
                  {teamName}
                </a>
                {' • '}
                {meetingDate}
              </>
            )}
          </td>
        </tr>
      </tbody>
    </table>
  )
}

export default SummaryHeader
