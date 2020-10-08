import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import {ScopePhaseAreaJira_meeting} from '../__generated__/ScopePhaseAreaJira_meeting.graphql'
import ScopePhaseAreaAddJira from './ScopePhaseAreaAddJira'
import ScopePhaseAreaJiraScoping from './ScopePhaseAreaJiraScoping'

interface Props {
  gotoParabol: () => void
  meeting: ScopePhaseAreaJira_meeting
}

const ScopePhaseAreaJira = (props: Props) => {
  const {gotoParabol, meeting} = props
  const {viewerMeetingMember} = meeting
  const {teamMember} = viewerMeetingMember
  const {integrations} = teamMember
  const {atlassian} = integrations
  const hasAuth = atlassian?.isActive ?? false
  if (!hasAuth) return <ScopePhaseAreaAddJira gotoParabol={gotoParabol} meeting={meeting} />
  return <ScopePhaseAreaJiraScoping meeting={meeting} />
}

export default createFragmentContainer(ScopePhaseAreaJira, {
  meeting: graphql`
    fragment ScopePhaseAreaJira_meeting on PokerMeeting {
      ...ScopePhaseAreaAddJira_meeting
      ...ScopePhaseAreaJiraScoping_meeting
      viewerMeetingMember {
        teamMember {
          integrations {
            atlassian {
              isActive
            }
          }
        }
      }
    }
  `
})
