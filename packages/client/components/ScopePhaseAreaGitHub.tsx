import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import {ScopePhaseAreaGitHub_meeting$key} from '../__generated__/ScopePhaseAreaGitHub_meeting.graphql'
import {Providers} from '../types/constEnums'
import ScopePhaseAreaAddGitHub from './ScopePhaseAreaAddGitHub'
import ScopePhaseAreaGitHubScoping from './ScopePhaseAreaGitHubScoping'

interface Props {
  isActive: boolean
  gotoParabol: () => void
  meetingRef: ScopePhaseAreaGitHub_meeting$key
}

graphql`
  fragment ScopePhaseAreaGitHub_teamMember on TeamMember {
    integrations {
      github {
        isActive
        scope
      }
    }
  }
`
const ScopePhaseAreaGitHub = (props: Props) => {
  const {isActive, gotoParabol, meetingRef} = props
  const meeting = useFragment(
    graphql`
      fragment ScopePhaseAreaGitHub_meeting on PokerMeeting {
        ...ScopePhaseAreaAddGitHub_meeting
        ...ScopePhaseAreaGitHubScoping_meeting
        viewerMeetingMember {
          teamMember {
            ...ScopePhaseAreaGitHub_teamMember @relay(mask: false)
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
  const hasAuth = integrations?.github?.scope === Providers.GITHUB_SCOPE
  if (!hasAuth) return <ScopePhaseAreaAddGitHub gotoParabol={gotoParabol} meetingRef={meeting} />
  return <ScopePhaseAreaGitHubScoping meetingRef={meeting} />
}

export default ScopePhaseAreaGitHub
