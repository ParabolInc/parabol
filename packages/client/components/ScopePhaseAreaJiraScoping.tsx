import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import {ScopePhaseAreaJiraScoping_meeting} from '../__generated__/ScopePhaseAreaJiraScoping_meeting.graphql'
import JiraScopingSearchBar from './JiraScopingSearchBar'
import JiraScopingSearchResultsRoot from './JiraScopingSearchResultsRoot'
interface Props {
  meeting: ScopePhaseAreaJiraScoping_meeting
}

const ScopePhaseAreaJiraScoping = (props: Props) => {
  const {meeting} = props
  const {teamId, jiraSearchQuery} = meeting
  return (
    <>
      <JiraScopingSearchBar meeting={meeting} />
      <JiraScopingSearchResultsRoot teamId={teamId} queryString={jiraSearchQuery} isJQL={false} />
    </>
  )
}

export default createFragmentContainer(ScopePhaseAreaJiraScoping, {
  meeting: graphql`
    fragment ScopePhaseAreaJiraScoping_meeting on PokerMeeting {
      ...JiraScopingSearchBar_meeting
      teamId
      jiraSearchQuery
    }
  `
})
