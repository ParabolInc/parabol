import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import {ScopePhaseAreaLinearScoping_meeting$key} from '../__generated__/ScopePhaseAreaLinearScoping_meeting.graphql'
import LinearScopingSearchBar from './LinearScopingSearchBar'
import LinearScopingSearchResultsRoot from './LinearScopingSearchResultsRoot'

interface Props {
  meetingRef: ScopePhaseAreaLinearScoping_meeting$key
}

const ScopePhaseAreaLinearScoping = (props: Props) => {
  const {meetingRef} = props
  const meeting = useFragment(
    graphql`
      fragment ScopePhaseAreaLinearScoping_meeting on PokerMeeting {
        ...LinearScopingSearchBar_meeting
        ...LinearScopingSearchResultsRoot_meeting
      }
    `,
    meetingRef
  )
  return (
    <>
      <LinearScopingSearchBar meetingRef={meeting} />
      <LinearScopingSearchResultsRoot meetingRef={meeting} />
    </>
  )
}

export default ScopePhaseAreaLinearScoping
