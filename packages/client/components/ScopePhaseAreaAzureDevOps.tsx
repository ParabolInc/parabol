import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
import {ScopePhaseAreaAzureDevOps_meeting$key} from '../__generated__/ScopePhaseAreaAzureDevOps_meeting.graphql'
import ScopePhaseAreaAddAzureDevOps from './ScopePhaseAreaAddAzureDevOps'
import ScopePhaseAreaAzureDevOpsScoping from './ScopePhaseAreaAzureDevOpsScoping'

interface Props {
  isActive: boolean
  gotoParabol: () => void
  meetingRef: ScopePhaseAreaAzureDevOps_meeting$key
}

graphql`
  fragment ScopePhaseAreaAzureDevOps_teamMember on TeamMember {
    integrations {
      azureDevOps {
        auth {
          id
        }
      }
    }
  }
`
const ScopePhaseAreaAzureDevOps = (props: Props) => {
  const {isActive, gotoParabol, meetingRef} = props
  const meeting = useFragment(
    graphql`
      fragment ScopePhaseAreaAzureDevOps_meeting on PokerMeeting {
        ...ScopePhaseAreaAddAzureDevOps_meeting
        ...ScopePhaseAreaAzureDevOpsScoping_meeting
        viewerMeetingMember {
          teamMember {
            ...ScopePhaseAreaAzureDevOps_teamMember @relay(mask: false)
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
  const hasAuth = !!integrations.azureDevOps?.auth
  if (!hasAuth)
    return <ScopePhaseAreaAddAzureDevOps gotoParabol={gotoParabol} meetingRef={meeting} />
  return <ScopePhaseAreaAzureDevOpsScoping meetingRef={meeting} />
}

export default ScopePhaseAreaAzureDevOps
