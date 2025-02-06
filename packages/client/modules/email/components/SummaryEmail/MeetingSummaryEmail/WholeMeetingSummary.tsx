import graphql from 'babel-plugin-relay/macro'
import {
  WholeMeetingSummary_meeting$data,
  WholeMeetingSummary_meeting$key
} from 'parabol-client/__generated__/WholeMeetingSummary_meeting.graphql'
import {useFragment} from 'react-relay'
import WholeMeetingSummaryLoading from './WholeMeetingSummaryLoading'
import WholeMeetingSummaryResult from './WholeMeetingSummaryResult'

interface Props {
  meetingRef: WholeMeetingSummary_meeting$key
}

const isServer = typeof window === 'undefined'
const hasAiApiKey = isServer
  ? !!process.env.OPEN_AI_API_KEY
  : !!window.__ACTION__ && !!window.__ACTION__.hasOpenAI

const hasContent = (meeting: WholeMeetingSummary_meeting$data): boolean => {
  if (meeting.__typename === 'RetrospectiveMeeting') {
    const reflections = meeting.reflectionGroups?.flatMap((group) => group.reflections)
    return Boolean(reflections?.length && reflections.length > 1)
  }
  if (meeting.__typename === 'TeamPromptMeeting') {
    return Boolean(meeting.responses?.length)
  }
  return false
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
          useAI
        }
        ... on RetrospectiveMeeting {
          isLoadingSummary
          reflectionGroups(sortBy: voteCount) {
            reflections {
              id
            }
          }
        }
        ... on TeamPromptMeeting {
          isLoadingSummary
          responses {
            id
          }
        }
      }
    `,
    meetingRef
  )

  const {organization} = meeting
  const {useAI} = organization

  if (!useAI || !hasAiApiKey || !hasContent(meeting)) return null

  if (meeting.isLoadingSummary) return <WholeMeetingSummaryLoading />

  return <WholeMeetingSummaryResult meetingRef={meeting} />
}

export default WholeMeetingSummary
