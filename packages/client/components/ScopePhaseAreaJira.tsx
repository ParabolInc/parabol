import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
import {ScopePhaseAreaJira_meeting$key} from '../__generated__/ScopePhaseAreaJira_meeting.graphql'
import ScopePhaseAreaAddJira from './ScopePhaseAreaAddJira'
import ScopePhaseAreaJiraScoping from './ScopePhaseAreaJiraScoping'

interface Props {
  isActive: boolean
  gotoParabol: () => void
  meetingRef: ScopePhaseAreaJira_meeting$key
}

const ScopePhaseAreaJira = (props: Props) => {
  const {isActive, gotoParabol, meetingRef} = props
  const meeting = useFragment(
    graphql`
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
    `,
    meetingRef
  )

  const {viewerMeetingMember} = meeting
  if (!viewerMeetingMember || !isActive) return null
  const {teamMember} = viewerMeetingMember
  const {integrations} = teamMember
  const hasAuth = integrations?.atlassian?.isActive ?? false
  if (!hasAuth) return <ScopePhaseAreaAddJira gotoParabol={gotoParabol} meetingRef={meeting} />
  return <ScopePhaseAreaJiraScoping meetingRef={meeting} />
}

export default ScopePhaseAreaJira
