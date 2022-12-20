import graphql from 'babel-plugin-relay/macro'
import {PALETTE} from 'parabol-client/styles/paletteV3'
import {FONT_FAMILY} from 'parabol-client/styles/typographyV2'
import {WholeMeetingSummary_meeting$key} from 'parabol-client/__generated__/WholeMeetingSummary_meeting.graphql'
import React from 'react'
import {useFragment} from 'react-relay'
import Ellipsis from '../../../../../components/Ellipsis/Ellipsis'
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
  meetingRef: WholeMeetingSummary_meeting$key
}

const WholeMeetingSummary = (props: Props) => {
  const {meetingRef} = props
  const meeting = useFragment(
    graphql`
      fragment WholeMeetingSummary_meeting on RetrospectiveMeeting {
        summary
        reflectionGroups(sortBy: voteCount) {
          summary
        }
        phases {
          phaseType
          ... on DiscussPhase {
            stages {
              discussion {
                summary
              }
            }
          }
        }
        team {
          tier
        }
      }
    `,
    meetingRef
  )
  const {summary: wholeMeetingSummary, team, reflectionGroups, phases} = meeting
  const discussPhase = phases.find((phase) => phase.phaseType === 'discuss')
  const {stages} = discussPhase ?? {}
  const explainerText = team?.tier === 'starter' ? AIExplainer.STARTER : AIExplainer.PREMIUM_MEETING
  const hasTopicSummary = reflectionGroups.some((group) => group.summary)
  const hasDiscussionSummary = !!stages?.some((stage) => stage.discussion?.summary)
  const hasOpenAISummary = hasTopicSummary || hasDiscussionSummary
  if (!hasOpenAISummary) return null
  if (hasOpenAISummary && !wholeMeetingSummary) {
    return (
      <tr
        style={{
          borderBottom: `1px solid ${PALETTE.SLATE_400}`
        }}
      >
        <td
          align='center'
          style={{
            padding: '20px 0px',
            borderBottom: `1px solid ${PALETTE.SLATE_400}`
          }}
        >
          <tr>
            <td style={explainerStyle}>
              {'Hold tight! Our AI 🤖 is generating your meeting summary'}
              <Ellipsis />
            </td>
          </tr>
        </td>
      </tr>
    )
  }
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

export default WholeMeetingSummary
