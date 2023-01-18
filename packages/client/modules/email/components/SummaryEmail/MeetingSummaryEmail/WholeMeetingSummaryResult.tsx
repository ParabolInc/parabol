import graphql from 'babel-plugin-relay/macro'
import {PALETTE} from 'parabol-client/styles/paletteV3'
import {FONT_FAMILY} from 'parabol-client/styles/typographyV2'
import {WholeMeetingSummaryResult_meeting$key} from 'parabol-client/__generated__/WholeMeetingSummaryResult_meeting.graphql'
import React, {useEffect} from 'react'
import {useFragment} from 'react-relay'
import useAtmosphere from '../../../../../hooks/useAtmosphere'
import SendClientSegmentEventMutation from '../../../../../mutations/SendClientSegmentEventMutation'
import {AIExplainer} from '../../../../../types/constEnums'
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
  meetingRef: WholeMeetingSummaryResult_meeting$key
}

const mapSentimentScoreToEmojis = (sentimentScore: number | null) => {
  if (!sentimentScore) return ''
  if (sentimentScore <= -0.6) {
    return '🟢⚪️⚪️⚪️⚪️'
  } else if (sentimentScore > -0.6 && sentimentScore <= -0.2) {
    return '🟢🟢⚪️⚪️⚪️'
  } else if (sentimentScore > -0.2 && sentimentScore <= 0.2) {
    return '️️🟢🟢🟢⚪️⚪️'
  } else if (sentimentScore > 0.2 && sentimentScore <= 0.6) {
    return '🟢🟢🟢🟢⚪️'
  } else {
    return '🟢🟢🟢🟢🟢'
  }
}

const WholeMeetingSummaryResult = (props: Props) => {
  const {meetingRef} = props
  const meeting = useFragment(
    graphql`
      fragment WholeMeetingSummaryResult_meeting on RetrospectiveMeeting {
        __typename
        id
        summary
        sentimentScore
        team {
          tier
        }
      }
    `,
    meetingRef
  )
  const atmosphere = useAtmosphere()
  const {summary: wholeMeetingSummary, team, sentimentScore} = meeting
  const explainerText = team?.tier === 'starter' ? AIExplainer.STARTER : AIExplainer.PREMIUM_MEETING
  useEffect(() => {
    SendClientSegmentEventMutation(atmosphere, 'AI Summary Viewed', {
      source: 'Meeting Summary',
      tier: meeting.team.tier,
      meetingId: meeting.id
    })
  }, [])
  return (
    <>
      <tr>
        <td align='center' style={{paddingTop: 20}}>
          <tr>
            <td style={explainerStyle}>{explainerText}</td>
          </tr>
          <tr>
            <td align='center' style={topicTitleStyle}>
              {'🤖 Meeting Summary'}
            </td>
          </tr>
          <tr>
            <td style={textStyle}>{wholeMeetingSummary}</td>
          </tr>
          <tr>
            <td align='center' style={topicTitleStyle}>
              {'🩺 Team Health'}
            </td>
          </tr>
          <tr>
            <td style={textStyle}>{mapSentimentScoreToEmojis(sentimentScore)}</td>
          </tr>
        </td>
      </tr>
      <EmailBorderBottom />
    </>
  )
}

export default WholeMeetingSummaryResult
