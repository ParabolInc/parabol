import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
import {ScopePhaseAreaGitLab_meeting$key} from '../__generated__/ScopePhaseAreaGitLab_meeting.graphql'
import ScopePhaseAreaAddGitLab from './ScopePhaseAreaAddGitLab'

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
          accessToken
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
  const hasAuth = !!integrations?.gitlab?.auth?.accessToken
  if (!hasAuth) return <ScopePhaseAreaAddGitLab gotoParabol={gotoParabol} meetingRef={meeting} />
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      {'Integrated! 🥳'}
    </div>
  )
}

export default ScopePhaseAreaGitLab
