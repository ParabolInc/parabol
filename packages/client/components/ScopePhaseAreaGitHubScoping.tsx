import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
import {ScopePhaseAreaGitHubScoping_meeting$key} from '../__generated__/ScopePhaseAreaGitHubScoping_meeting.graphql'
import GitHubScopingSearchBar from './GitHubScopingSearchBar'
import GitHubScopingSearchResultsRoot from './GitHubScopingSearchResultsRoot'
interface Props {
  meetingRef: ScopePhaseAreaGitHubScoping_meeting$key
}

const ScopePhaseAreaGitHubScoping = (props: Props) => {
  const {meetingRef} = props
  const meeting = useFragment(
    graphql`
      fragment ScopePhaseAreaGitHubScoping_meeting on PokerMeeting {
        ...GitHubScopingSearchBar_meeting
        ...GitHubScopingSearchResultsRoot_meeting
      }
    `,
    meetingRef
  )
  return (
    <>
      <GitHubScopingSearchBar meetingRef={meeting} />
      <GitHubScopingSearchResultsRoot meetingRef={meeting} />
    </>
  )
}

export default ScopePhaseAreaGitHubScoping
