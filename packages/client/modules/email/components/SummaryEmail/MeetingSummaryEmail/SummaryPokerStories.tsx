import graphql from 'babel-plugin-relay/macro'
import {PALETTE} from 'parabol-client/styles/paletteV3'
import {FONT_FAMILY} from 'parabol-client/styles/typographyV2'
import {SummaryPokerStories_meeting$key} from 'parabol-client/__generated__/SummaryPokerStories_meeting.graphql'
import React from 'react'
import {useFragment} from 'react-relay'
import makeAppURL from '../../../../../utils/makeAppURL'
import AnchorIfEmail from './AnchorIfEmail'
import EmailBorderBottom from './EmailBorderBottom'

const tableStyles = {
  border: `1px solid ${PALETTE.SLATE_400}`,
  borderRadius: 8,
  borderSpacing: 0,
  marginTop: 24
}

const rowStyle = {
  height: 32
}

const titleStyle = (isLast: boolean) => ({
  borderBottom: isLast ? undefined : `1px solid ${PALETTE.SLATE_400}`,
  fontWeight: 600,
  paddingLeft: 16
})

const titleLinkStyle = {
  color: PALETTE.SKY_500,
  display: 'block',
  fontFamily: FONT_FAMILY.SANS_SERIF,
  fontWeight: 600,
  textDecoration: 'none'
}

const scoreStyle = (isLast: boolean) => ({
  borderBottom: isLast ? undefined : `1px solid ${PALETTE.SLATE_400}`,
  fontWeight: 600
})

interface Props {
  appOrigin: string
  isEmail: boolean
  meeting: SummaryPokerStories_meeting$key
}

const SummaryPokerStories = (props: Props) => {
  const {appOrigin, isEmail, meeting: meetingRef} = props
  const meeting = useFragment(
    graphql`
      fragment SummaryPokerStories_meeting on NewMeeting {
        id
        ... on PokerMeeting {
          __typename
          phases {
            phaseType
            ... on EstimatePhase {
              __typename
              stages {
                id
                finalScore
                taskId
                task {
                  title
                  integration {
                    ... on JiraIssue {
                      __typename
                      summary
                      issueKey
                    }
                    ... on _xGitHubIssue {
                      __typename
                      number
                      title
                    }
                  }
                }
              }
            }
          }
        }
      }
    `,
    meetingRef
  )
  const {id: meetingId, phases} = meeting
  if (meeting.__typename !== 'PokerMeeting') return null
  const estimatePhase = phases?.find((phase) => phase?.__typename === 'EstimatePhase')
  if (!estimatePhase) return null
  const stages = estimatePhase.stages!
  const usedTaskIds = new Set<string>()
  return (
    <>
      <tr>
        <td>
          <table width='80%' height='100%' align='center' bgcolor={'#FFFFFF'} style={tableStyles}>
            <tbody>
              {stages.map((stage, idx) => {
                const {id, task, finalScore, taskId} = stage
                if (usedTaskIds.has(taskId) || !task) return null
                usedTaskIds.add(taskId)
                const isLast = idx === stages.length - 1
                let title = task.title
                const {integration} = task
                if (integration?.__typename === 'JiraIssue') {
                  title = integration.summary
                } else if (integration?.__typename === '_xGitHubIssue') {
                  title = integration.title
                }
                const urlPath = `/meet/${meetingId}/estimate/${idx + 1}`
                const to = isEmail
                  ? makeAppURL(appOrigin, urlPath, {
                      searchParams: {
                        utm_source: 'summary email',
                        utm_medium: 'email',
                        utm_campaign: 'after-meeting'
                      }
                    })
                  : urlPath
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

export default SummaryPokerStories
