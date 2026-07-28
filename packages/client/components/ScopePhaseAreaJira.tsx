import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import type {ScopePhaseAreaJira_meeting$key} from '../__generated__/ScopePhaseAreaJira_meeting.graphql'
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
                # fetched so openOAuth's held-scope union can see them in the store
                hasJiraScopes
                hasConfluenceScopes
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
  // an active grant may be Confluence-only — Jira scoping needs Jira capability,
  // and AddJira's OAuth unions the held Confluence scopes so nothing is lost
  const hasAuth =
    (integrations?.atlassian?.isActive && integrations?.atlassian?.hasJiraScopes) ?? false
  if (!hasAuth) return <ScopePhaseAreaAddJira gotoParabol={gotoParabol} meetingRef={meeting} />
  return <ScopePhaseAreaJiraScoping meetingRef={meeting} />
}

export default ScopePhaseAreaJira
