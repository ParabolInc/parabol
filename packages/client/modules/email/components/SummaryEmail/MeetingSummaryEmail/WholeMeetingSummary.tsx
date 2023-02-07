import graphql from 'babel-plugin-relay/macro'
import {WholeMeetingSummary_meeting$key} from 'parabol-client/__generated__/WholeMeetingSummary_meeting.graphql'
import React from 'react'
import {useFragment} from 'react-relay'
import WholeMeetingSummaryLoading from './WholeMeetingSummaryLoading'
import WholeMeetingSummaryResult from './WholeMeetingSummaryResult'

interface Props {
  meetingRef: WholeMeetingSummary_meeting$key
}

const WholeMeetingSummary = (props: Props) => {
  const {meetingRef} = props
  const meeting = useFragment(
    graphql`
      fragment WholeMeetingSummary_meeting on NewMeeting {
        ... on RetrospectiveMeeting {
          ...WholeMeetingSummaryResult_meeting
          __typename
          id
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
        }
      }
    `,
    meetingRef
  )
  if (meeting.__typename !== 'RetrospectiveMeeting') return null
  const {summary: wholeMeetingSummary, reflectionGroups, phases} = meeting
  const discussPhase = phases.find((phase) => phase.phaseType === 'discuss')
  const {stages} = discussPhase ?? {}
  const hasTopicSummary = reflectionGroups.some((group) => group.summary)
  const hasDiscussionSummary = !!stages?.some((stage) => stage.discussion?.summary)
  const hasOpenAISummary = hasTopicSummary || hasDiscussionSummary
  if (!hasOpenAISummary) return null
  if (hasOpenAISummary && !wholeMeetingSummary) return <WholeMeetingSummaryLoading />
  return <WholeMeetingSummaryResult meetingRef={meeting} />
}

export default WholeMeetingSummary
