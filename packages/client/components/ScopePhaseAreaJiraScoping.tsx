import graphql from 'babel-plugin-relay/macro'
import {createFragmentContainer} from 'react-relay'
import {ScopePhaseAreaJiraScoping_meeting} from '../__generated__/ScopePhaseAreaJiraScoping_meeting.graphql'
import JiraScopingSearchBar from './JiraScopingSearchBar'
import JiraScopingSearchResults from './JiraScopingSearchResults'
import React from 'react'
interface Props {
  meeting: ScopePhaseAreaJiraScoping_meeting
}

const ScopePhaseAreaJiraScoping = (props: Props) => {
  const {meeting} = props
  return (
    <>
      <JiraScopingSearchBar meeting={meeting} />
      <JiraScopingSearchResults meeting={meeting} />
    </>
  )
}

export default createFragmentContainer(ScopePhaseAreaJiraScoping, {
  meeting: graphql`
    fragment ScopePhaseAreaJiraScoping_meeting on PokerMeeting {
      ...JiraScopingSearchBar_meeting
      ...JiraScopingSearchResults_meeting
      viewerMeetingMember {
        teamMember {
          atlassianAuth {
            isActive
          }
        }
      }
    }
  `
})
