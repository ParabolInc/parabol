import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import type {ScopePhaseAreaJiraServerScoping_meeting$key} from '../__generated__/ScopePhaseAreaJiraServerScoping_meeting.graphql'
import JiraServerScopingSearchBar from './JiraServerScopingSearchBar'
import JiraServerScopingSearchResultsRoot from './JiraServerScopingSearchResultsRoot'

interface Props {
  meetingRef: ScopePhaseAreaJiraServerScoping_meeting$key
}

const ScopePhaseAreaJiraServerScoping = (props: Props) => {
  const {meetingRef} = props
  const meeting = useFragment(
    graphql`
      fragment ScopePhaseAreaJiraServerScoping_meeting on PokerMeeting {
        ...JiraServerScopingSearchBar_meeting
        ...JiraServerScopingSearchResultsRoot_meeting
      }
    `,
    meetingRef
  )
  return (
    <>
      <JiraServerScopingSearchBar meetingRef={meeting} />
      <JiraServerScopingSearchResultsRoot meetingRef={meeting} />
    </>
  )
}

export default ScopePhaseAreaJiraServerScoping
