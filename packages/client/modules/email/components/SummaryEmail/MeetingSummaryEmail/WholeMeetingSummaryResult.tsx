import graphql from 'babel-plugin-relay/macro'
import DOMPurify from 'dompurify'
import {marked} from 'marked'
import React, {useEffect} from 'react'
import {useFragment} from 'react-relay'
import {WholeMeetingSummaryResult_meeting$key} from '../../../../../__generated__/WholeMeetingSummaryResult_meeting.graphql'
import useAtmosphere from '../../../../../hooks/useAtmosphere'
import {PALETTE} from '../../../../../styles/paletteV3'
import {FONT_FAMILY} from '../../../../../styles/typographyV2'
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

const WholeMeetingSummaryResult = ({meetingRef}: Props) => {
  const atmosphere = useAtmosphere()

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
  useEffect(() => {
    SendClientSideEvent(atmosphere, 'AI Summary Viewed', {
      source: 'Meeting Summary',
      tier: meeting.team.billingTier,
      meetingId: meeting.id
    })
  }, [atmosphere, meeting.id, meeting.team.billingTier])

  const {summary: wholeMeetingSummary, team} = meeting

  if (!wholeMeetingSummary) return null
  const test = `The budget work is recognized for its future value in improving focus and communication within the team ([link](https://action.parabol.co/meet/twbP2qPXNK/discuss/3](https://action.parabol.co/meet/twbP2qPXNK/discuss/3) )).`
  const renderedSummary = marked(test, {
    gfm: true,
    breaks: true
  }) as string
  const sanitizedSummary = DOMPurify.sanitize(renderedSummary)

  const explainerText = team?.tier === 'starter' ? AIExplainer.STARTER : AIExplainer.PREMIUM_MEETING

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
            <td
              align='center'
              style={textStyle}
              className='summary-link-style'
              dangerouslySetInnerHTML={{__html: sanitizedSummary}}
            />
          </tr>
        </td>
      </tr>
      <EmailBorderBottom />
    </>
  )
}

export default WholeMeetingSummaryResult
