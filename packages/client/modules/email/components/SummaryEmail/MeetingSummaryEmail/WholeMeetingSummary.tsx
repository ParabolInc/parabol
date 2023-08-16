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
        ...WholeMeetingSummaryResult_meeting
        __typename
        id
        summary
        organization {
          featureFlags {
            standupAISummary
            noAISummary
          }
        }
        ... on RetrospectiveMeeting {
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
        ... on TeamPromptMeeting {
          responses {
            id
          }
        }
      }
    `,
    meetingRef
  )
  if (meeting.__typename === 'RetrospectiveMeeting') {
    const {summary: wholeMeetingSummary, reflectionGroups, phases} = meeting
    const discussPhase = phases!.find((phase) => phase.phaseType === 'discuss')
    const {stages} = discussPhase ?? {}
    const hasTopicSummary = reflectionGroups!.some((group) => group.summary)
    const hasDiscussionSummary = !!stages?.some((stage) => stage.discussion?.summary)
    const hasOpenAISummary = hasTopicSummary || hasDiscussionSummary
    if (!hasOpenAISummary) return null
    if (hasOpenAISummary && !wholeMeetingSummary) return <WholeMeetingSummaryLoading />
    return <WholeMeetingSummaryResult meetingRef={meeting} />
  } else if (meeting.__typename === 'TeamPromptMeeting') {
    const {summary: wholeMeetingSummary, responses, organization} = meeting
    if (!organization.featureFlags.standupAISummary || organization.featureFlags.noAISummary) {
      return null
    }
    if (!responses || responses.length === 0) return null
    if (!wholeMeetingSummary) return <WholeMeetingSummaryLoading />
    return <WholeMeetingSummaryResult meetingRef={meeting} />
  }
  return null
}

export default WholeMeetingSummary
