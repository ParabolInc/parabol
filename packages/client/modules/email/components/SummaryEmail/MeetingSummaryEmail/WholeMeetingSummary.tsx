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
            reflections {
              id
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
    const {summary: wholeMeetingSummary, reflectionGroups, organization} = meeting
    const hasMoreThanOneReflection =
      (reflectionGroups?.length && reflectionGroups.length > 1) ||
      reflectionGroups?.some((group) => group.reflections.length > 1)
    if (!hasMoreThanOneReflection || organization.featureFlags.noAISummary) return null
    if (!wholeMeetingSummary) return <WholeMeetingSummaryLoading />
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
