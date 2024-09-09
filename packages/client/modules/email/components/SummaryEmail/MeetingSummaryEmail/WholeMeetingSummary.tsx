import graphql from 'babel-plugin-relay/macro'
import {WholeMeetingSummary_meeting$key} from 'parabol-client/__generated__/WholeMeetingSummary_meeting.graphql'
import React from 'react'
import {useFragment} from 'react-relay'
import WholeMeetingSummaryLoading from './WholeMeetingSummaryLoading'
import WholeMeetingSummaryResult from './WholeMeetingSummaryResult'

interface Props {
  meetingRef: WholeMeetingSummary_meeting$key
}

const isServer = typeof window === 'undefined'
const hasAI = isServer
  ? !!process.env.OPEN_AI_API_KEY
  : !!window.__ACTION__ && !!window.__ACTION__.hasOpenAI

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
          standupAISummary: featureFlag(featureName: "standupAISummary")
          noAISummary: featureFlag(featureName: "standupAInoAISummarySummary")
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
    const reflections = reflectionGroups?.flatMap((group) => group.reflections) // reflectionCount hasn't been calculated yet so check reflections length
    const hasMoreThanOneReflection = reflections?.length && reflections.length > 1
    if (!hasMoreThanOneReflection || organization.noAISummary || !hasAI) return null
    if (!wholeMeetingSummary) return <WholeMeetingSummaryLoading />
    return <WholeMeetingSummaryResult meetingRef={meeting} />
  } else if (meeting.__typename === 'TeamPromptMeeting') {
    const {summary: wholeMeetingSummary, responses, organization} = meeting
    if (
      !organization.standupAISummary ||
      organization.noAISummary ||
      !hasAI ||
      !responses ||
      responses.length === 0
    ) {
      return null
    }
    if (!wholeMeetingSummary) return <WholeMeetingSummaryLoading />
    return <WholeMeetingSummaryResult meetingRef={meeting} />
  }
  return null
}

export default WholeMeetingSummary
