import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
import {ScopePhaseAreaJiraScoping_meeting$key} from '../__generated__/ScopePhaseAreaJiraScoping_meeting.graphql'
import JiraScopingSearchBar from './JiraScopingSearchBar'
import JiraScopingSearchResultsRoot from './JiraScopingSearchResultsRoot'
interface Props {
  meetingRef: ScopePhaseAreaJiraScoping_meeting$key
}

const ScopePhaseAreaJiraScoping = (props: Props) => {
  const {meetingRef} = props

  const meeting = useFragment(
    graphql`
      fragment ScopePhaseAreaJiraScoping_meeting on PokerMeeting {
        ...JiraScopingSearchBar_meeting
        ...JiraScopingSearchResultsRoot_meeting
      }
    `,
    meetingRef
  )

  return (
    <>
      <JiraScopingSearchBar meetingRef={meeting} />
      <JiraScopingSearchResultsRoot meeting={meeting} />
    </>
  )
}

export default ScopePhaseAreaJiraScoping
