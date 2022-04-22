import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
import {ScopePhaseAreaGitLabScoping_meeting$key} from '../__generated__/ScopePhaseAreaGitLabScoping_meeting.graphql'
import GitLabScopingSearchBar from './GitLabScopingSearchBar'
import GitLabScopingSearchResultsRoot from './GitLabScopingSearchResultsRoot'

interface Props {
  meetingRef: ScopePhaseAreaGitLabScoping_meeting$key
}

const ScopePhaseAreaGitLabScoping = (props: Props) => {
  const {meetingRef} = props
  const meeting = useFragment(
    graphql`
      fragment ScopePhaseAreaGitLabScoping_meeting on PokerMeeting {
        ...GitLabScopingSearchBar_meeting
        ...GitLabScopingSearchResultsRoot_meeting
      }
    `,
    meetingRef
  )
  return (
    <>
      <GitLabScopingSearchBar meetingRef={meeting} />
      <GitLabScopingSearchResultsRoot meetingRef={meeting} />
    </>
  )
}

export default ScopePhaseAreaGitLabScoping
