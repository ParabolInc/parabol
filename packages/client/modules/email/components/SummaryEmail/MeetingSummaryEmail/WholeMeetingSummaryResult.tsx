import graphql from 'babel-plugin-relay/macro'
import {WholeMeetingSummaryResult_meeting$key} from 'parabol-client/__generated__/WholeMeetingSummaryResult_meeting.graphql'
import {PALETTE} from 'parabol-client/styles/paletteV3'
import {FONT_FAMILY} from 'parabol-client/styles/typographyV2'
import React, {useEffect} from 'react'
import {useFragment} from 'react-relay'
import useAtmosphere from '../../../../../hooks/useAtmosphere'
import {AIExplainer} from '../../../../../types/constEnums'
import SendClientSideEvent from '../../../../../utils/SendClientSideEvent'
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
  fontSize: 14,
  whiteSpace: 'pre-line',
  textAlign: 'left'
} as const

interface Props {
  meetingRef: WholeMeetingSummaryResult_meeting$key
}

const WholeMeetingSummaryResult = (props: Props) => {
  const {meetingRef} = props
  const meeting = useFragment(
    graphql`
      fragment WholeMeetingSummaryResult_meeting on NewMeeting {
        __typename
        id
        summary
        team {
          tier
          billingTier
        }
      }
    `,
    meetingRef
  )
  const atmosphere = useAtmosphere()
  const {summary: wholeMeetingSummary, team} = meeting
  const explainerText = team?.tier === 'starter' ? AIExplainer.STARTER : AIExplainer.PREMIUM_MEETING
  useEffect(() => {
    SendClientSideEvent(atmosphere, 'AI Summary Viewed', {
      source: 'Meeting Summary',
      tier: meeting.team.billingTier,
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
        </td>
      </tr>
      <EmailBorderBottom />
    </>
  )
}

export default WholeMeetingSummaryResult
