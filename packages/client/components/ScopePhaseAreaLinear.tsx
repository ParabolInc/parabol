import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import {ScopePhaseAreaLinear_meeting$key} from '../__generated__/ScopePhaseAreaLinear_meeting.graphql'
import ScopePhaseAreaAddLinear from './ScopePhaseAreaAddLinear'
import ScopePhaseAreaLinearScoping from './ScopePhaseAreaLinearScoping'

interface Props {
  isActive: boolean
  gotoParabol: () => void
  meetingRef: ScopePhaseAreaLinear_meeting$key
}

graphql`
  fragment ScopePhaseAreaLinear_teamMember on TeamMember {
    integrations {
      linear {
        auth {
          id
        }
      }
    }
  }
`
const ScopePhaseAreaLinear = (props: Props) => {
  const {isActive, gotoParabol, meetingRef} = props
  const meeting = useFragment(
    graphql`
      fragment ScopePhaseAreaLinear_meeting on PokerMeeting {
        ...ScopePhaseAreaAddLinear_meeting
        ...ScopePhaseAreaLinearScoping_meeting
        viewerMeetingMember {
          teamMember {
            ...ScopePhaseAreaLinear_teamMember @relay(mask: false)
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
  const hasAuth = !!integrations.linear?.auth
  if (!hasAuth) {
    return <ScopePhaseAreaAddLinear gotoParabol={gotoParabol} meetingRef={meeting} />
  }
  return <ScopePhaseAreaLinearScoping meetingRef={meeting} />
}

export default ScopePhaseAreaLinear
