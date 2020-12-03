import graphql from 'babel-plugin-relay/macro'
import {PALETTE} from 'parabol-client/styles/paletteV2'
import {NewMeetingPhaseTypeEnum} from 'parabol-client/types/graphql'
import {SummaryPokerStories_meeting} from 'parabol-client/__generated__/SummaryPokerStories_meeting.graphql'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import {FONT_FAMILY} from '../../../../../client/styles/typographyV2'
import makeAppLink from '../../../../utils/makeAppLink'
import AnchorIfEmail from './AnchorIfEmail'
import EmailBorderBottom from './EmailBorderBottom'
import {meetingSummaryUrlParams} from 'parabol-server/email/components/MeetingSummaryEmailRootSSR'

const tableStyles = {
  border: `1px solid ${PALETTE.BORDER_GRAY}`,
  borderRadius: 8,
  borderSpacing: 0,
  marginTop: 24
}

const rowStyle = {
  height: 32
}

const titleStyle = (isLast: boolean) => ({
  borderBottom: isLast ? undefined : `1px solid ${PALETTE.BORDER_GRAY}`,
  fontWeight: 600,
  paddingLeft: 16
})

const titleLinkStyle = {
  color: PALETTE.TEXT_BLUE,
  display: 'block',
  fontFamily: FONT_FAMILY.SANS_SERIF,
  fontWeight: 600,
  textDecoration: 'none'
}

const scoreStyle = (isLast: boolean) => ({
  borderBottom: isLast ? undefined : `1px solid ${PALETTE.BORDER_GRAY}`,
  fontWeight: 600
})

interface Props {
  isEmail: boolean
  meeting: SummaryPokerStories_meeting
}

const SummaryPokerStories = (props: Props) => {
  const {isEmail, meeting} = props
  const {id: meetingId, phases} = meeting
  const estimatePhase = phases.find((phase) => phase.phaseType === NewMeetingPhaseTypeEnum.ESTIMATE)
  if (!estimatePhase) return null
  const stages = estimatePhase.stages!
  const usedServiceTaskIds = new Set<string>()
  return (
    <>
      <tr>
        <td>
          <table width='80%' height='100%' align='center' bgcolor={'#FFFFFF'} style={tableStyles}>
            <tbody>
              {stages.map((stage, idx) => {
                const {id, story, finalScore, serviceTaskId} = stage
                if (usedServiceTaskIds.has(serviceTaskId)) return null
                usedServiceTaskIds.add(serviceTaskId)
                const isLast = idx === stages.length - 1
                const title = story?.title ?? 'Unknown Story'
                const urlPath = `meet/${meetingId}/estimate/${usedServiceTaskIds.size}`
                const to = isEmail
                  ? makeAppLink(urlPath, {params: meetingSummaryUrlParams})
                  : `/${urlPath}`
                return (
                  <tr style={rowStyle} key={id}>
                    <td style={titleStyle(isLast)}>
                      <AnchorIfEmail href={to} isEmail={isEmail} style={titleLinkStyle}>
                        {title}
                      </AnchorIfEmail>
                    </td>
                    <td align={'center'} style={scoreStyle(isLast)}>
                      {finalScore || '—'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </td>
      </tr>
      <EmailBorderBottom />
    </>
  )
}

export default createFragmentContainer(SummaryPokerStories, {
  meeting: graphql`
    fragment SummaryPokerStories_meeting on PokerMeeting {
      id
      phases {
        phaseType
        ... on EstimatePhase {
          stages {
            id
            finalScore
            serviceTaskId
            story {
              title
            }
            dimension {
              name
            }
          }
        }
      }
    }
  `
})
