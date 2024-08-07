import graphql from 'babel-plugin-relay/macro'
import {marked} from 'marked'
import React, {useEffect} from 'react'
import {useFragment} from 'react-relay'
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

const linkStyle = {
  color: '#2563EB',
  textDecoration: 'underline'
}

interface Props {
  meetingRef: any // WholeMeetingSummaryResult_meeting$key
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

  const {summary: wholeMeetingSummary, team} = meeting
  const test =
    'The budget work is recognized for its future value in improving focus and communication within the team ([link](https://action.parabol.co/meet/twbP2qPXNK/discuss/3)).'

  const renderedTest = marked(test, {
    gfm: true,
    breaks: true,
    smartypants: true
  }).replace(
    /<a href="(.*?)">(.*?)<\/a>/g,
    `<a href="$1" style="color: ${linkStyle.color}; text-decoration: ${linkStyle.textDecoration};">$2</a>`
  )

  const explainerText = team?.tier === 'starter' ? AIExplainer.STARTER : AIExplainer.PREMIUM_MEETING

  useEffect(() => {
    SendClientSideEvent(atmosphere, 'AI Summary Viewed', {
      source: 'Meeting Summary',
      tier: meeting.team.billingTier,
      meetingId: meeting.id
    })
  }, [atmosphere, meeting.id, meeting.team.billingTier])

  return (
    <>
      <tr>
        <td align='center' style={{paddingTop: 20}}>
          <table>
            <tbody>
              <tr>
                <td style={explainerStyle}>{explainerText}</td>
              </tr>
              <tr>
                <td align='center' style={topicTitleStyle}>
                  {'🤖 Meeting Summary'}
                </td>
              </tr>
              <tr>
                <td style={textStyle} dangerouslySetInnerHTML={{__html: renderedTest}} />
              </tr>
            </tbody>
          </table>
        </td>
      </tr>
      <EmailBorderBottom />
    </>
  )
}

export default WholeMeetingSummaryResult
