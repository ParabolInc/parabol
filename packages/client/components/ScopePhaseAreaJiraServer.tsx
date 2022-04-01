import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
import {ScopePhaseAreaJiraServer_meeting$key} from '../__generated__/ScopePhaseAreaJiraServer_meeting.graphql'
import JiraServerScopingSearchResultsRoot from './JiraServerScopingSearchResultsRoot'
import ScopePhaseAreaAddJiraServer from './ScopePhaseAreaAddJiraServer'

interface Props {
  isActive: boolean
  gotoParabol: () => void
  meetingRef: ScopePhaseAreaJiraServer_meeting$key
}

graphql`
  fragment ScopePhaseAreaJiraServer_teamMember on TeamMember {
    integrations {
      jiraServer {
        auth {
          id
        }
      }
    }
  }
`
const ScopePhaseAreaJiraServer = (props: Props) => {
  const {isActive, gotoParabol, meetingRef} = props
  const meeting = useFragment(
    graphql`
      fragment ScopePhaseAreaJiraServer_meeting on PokerMeeting {
        ...ScopePhaseAreaAddJiraServer_meeting
        ...JiraServerScopingSearchResultsRoot_meeting
        viewerMeetingMember {
          teamMember {
            ...ScopePhaseAreaJiraServer_teamMember @relay(mask: false)
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
  const hasAuth = !!integrations.jiraServer.auth
  if (!hasAuth)
    return <ScopePhaseAreaAddJiraServer gotoParabol={gotoParabol} meetingRef={meeting} />
  return (
    <>
      {/*<JiraServerScopingSearchBar meeting={meeting} /> */}
      <JiraServerScopingSearchResultsRoot meetingRef={meeting} />
    </>
  )
}

export default ScopePhaseAreaJiraServer
