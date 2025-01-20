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
          responses {
            id
          }
        }
      }
    `,
    meetingRef
  )
  if (meeting.__typename === 'RetrospectiveMeeting') {
    const {reflectionGroups, organization, isLoadingSummary} = meeting
    const reflections = reflectionGroups?.flatMap((group) => group.reflections) // reflectionCount hasn't been calculated yet so check reflections length
    const hasMoreThanOneReflection = reflections?.length && reflections.length > 1
    const willReturnNull = !hasMoreThanOneReflection || !organization.useAI || !hasAiApiKey
    console.log('🚀 ~ willReturnNull:', willReturnNull)
    if (willReturnNull) return null
    if (isLoadingSummary) return <WholeMeetingSummaryLoading />
    return <WholeMeetingSummaryResult meetingRef={meeting} />
  } else if (meeting.__typename === 'TeamPromptMeeting') {
    const {summary: wholeMeetingSummary, responses, organization} = meeting
    const {useAI} = organization
    if (!useAI || !hasAiApiKey || !responses || responses.length === 0) {
      return null
    }
    if (!wholeMeetingSummary) return <WholeMeetingSummaryLoading />
    return <WholeMeetingSummaryResult meetingRef={meeting} />
  }
  return null
}

export default WholeMeetingSummary
