import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import {ScopePhaseAreaGitLab_meeting$key} from '../__generated__/ScopePhaseAreaGitLab_meeting.graphql'
import ScopePhaseAreaAddGitLab from './ScopePhaseAreaAddGitLab'
import ScopePhaseAreaGitLabScoping from './ScopePhaseAreaGitLabScoping'

interface Props {
  isActive: boolean
  gotoParabol: () => void
  meetingRef: ScopePhaseAreaGitLab_meeting$key
}

graphql`
  fragment ScopePhaseAreaGitLab_teamMember on TeamMember {
    integrations {
      gitlab {
        auth {
          id
        }
      }
    }
  }
`
const ScopePhaseAreaGitLab = (props: Props) => {
  const {isActive, gotoParabol, meetingRef} = props
  const meeting = useFragment(
    graphql`
      fragment ScopePhaseAreaGitLab_meeting on PokerMeeting {
        ...ScopePhaseAreaAddGitLab_meeting
        ...ScopePhaseAreaGitLabScoping_meeting
        viewerMeetingMember {
          teamMember {
            ...ScopePhaseAreaGitLab_teamMember @relay(mask: false)
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
  const hasAuth = !!integrations.gitlab?.auth
  if (!hasAuth) return <ScopePhaseAreaAddGitLab gotoParabol={gotoParabol} meetingRef={meeting} />
  return <ScopePhaseAreaGitLabScoping meetingRef={meeting} />
}

export default ScopePhaseAreaGitLab
