import graphql from 'babel-plugin-relay/macro'
import {PALETTE} from 'parabol-client/styles/paletteV3'
import {FONT_FAMILY} from 'parabol-client/styles/typographyV2'
import {WholeMeetingSummary_meeting$key} from 'parabol-client/__generated__/WholeMeetingSummary_meeting.graphql'
import React from 'react'
import {useFragment} from 'react-relay'
import EmailBorderBottom from './EmailBorderBottom'

const topicTitleStyle = {
  color: PALETTE.SLATE_700,
  fontFamily: FONT_FAMILY.SANS_SERIF,
  fontWeight: 600,
  lineHeight: '22px',
  fontSize: 14,
  padding: '8px 48px'
}

const explainerStyle = {
  color: PALETTE.SLATE_700,
  fontFamily: FONT_FAMILY.SANS_SERIF,
  fontStyle: 'italic',
  padding: '8px 48px',
  fontSize: 14
}

const textStyle = {
  color: PALETTE.SLATE_700,
  fontFamily: FONT_FAMILY.SANS_SERIF,
  padding: '0px 48px 8px 48px',
  fontSize: 14
}

interface Props {
  meetingRef: WholeMeetingSummary_meeting$key
}

const WholeMeetingSummary = (props: Props) => {
  const {meetingRef} = props
  const meeting = useFragment(
    graphql`
      fragment WholeMeetingSummary_meeting on RetrospectiveMeeting {
        summary
        team {
          tier
        }
      }
    `,
    meetingRef
  )
  const {summary, team} = meeting
  if (!summary) return null
  return (
    <>
      <tr>
        <td align='center' style={{paddingTop: 20}}>
          <tr>
            <td align='center' style={topicTitleStyle}>
              {'Meeting Summary'}
            </td>
          </tr>
          {team?.tier === 'personal' && (
            <tr>
              <td
                style={explainerStyle}
              >{`AI generated summaries are a premium feature. We'll share them with you in your first few retros so you can see what they're like.`}</td>
            </tr>
          )}
          <tr>
            <td style={textStyle}>{summary}</td>
          </tr>
        </td>
      </tr>
      <EmailBorderBottom />
    </>
  )
}

export default WholeMeetingSummary
