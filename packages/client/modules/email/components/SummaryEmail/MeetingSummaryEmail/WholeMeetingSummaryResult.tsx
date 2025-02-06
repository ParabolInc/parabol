import graphql from 'babel-plugin-relay/macro'
import {marked} from 'marked'
import {useEffect} from 'react'
import {useFragment} from 'react-relay'
import sanitizeHtml from 'sanitize-html'
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
  const renderedSummary = marked(wholeMeetingSummary, {
    gfm: true,
    breaks: true
  }) as string
  const sanitizedSummary = sanitizeHtml(renderedSummary)

  const explainerText = team?.tier === 'starter' ? AIExplainer.STARTER : AIExplainer.PREMIUM_MEETING

  return (
    <>
      <tr>
        <td align='center' style={{paddingTop: 20}}>
          <div style={explainerStyle}>{explainerText}</div>
          <div style={topicTitleStyle}>{'🤖 Meeting Summary'}</div>
          <div
            style={textStyle}
            className='link-style'
            dangerouslySetInnerHTML={{__html: sanitizedSummary}}
          />
        </td>
      </tr>
      <EmailBorderBottom />
    </>
  )
}

export default WholeMeetingSummaryResult
