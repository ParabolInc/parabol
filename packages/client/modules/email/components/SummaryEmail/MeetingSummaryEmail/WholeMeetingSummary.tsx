import graphql from 'babel-plugin-relay/macro'
import {WholeMeetingSummary_meeting$key} from 'parabol-client/__generated__/WholeMeetingSummary_meeting.graphql'
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

  if (!useAI || !hasAiApiKey) return null

  const hasContent = (() => {
    if (meeting.__typename === 'RetrospectiveMeeting') {
      const reflections = meeting.reflectionGroups?.flatMap((group) => group.reflections)
      return reflections?.length && reflections.length > 1
    } else if (meeting.__typename === 'TeamPromptMeeting') {
      return meeting.responses && meeting.responses.length > 0
    }
    return false
  })()

  if (!hasContent) return null
  if (meeting.isLoadingSummary) return <WholeMeetingSummaryLoading />

  return <WholeMeetingSummaryResult meetingRef={meeting} />
}

export default WholeMeetingSummary
