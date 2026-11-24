import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import type {
  NewMeetingPhaseTypeEnum,
  RetroSidebarPhaseListItemChildren_meeting$key
} from '~/__generated__/RetroSidebarPhaseListItemChildren_meeting.graphql'
import type useGotoStageId from '~/hooks/useGotoStageId'
import isPhaseComplete from '../utils/meetings/isPhaseComplete'
import MeetingSidebarTeamMemberStageItems from './MeetingSidebarTeamMemberStageItems'
import RetroSidebarDiscussSection from './RetroSidebarDiscussSection'
import RetroSidebarTeamHealthSection from './RetroTeamHealth/RetroSidebarTeamHealthSection'

interface Props {
  gotoStageId: ReturnType<typeof useGotoStageId>
  handleMenuClick: () => void
  phaseType: NewMeetingPhaseTypeEnum
  meeting: RetroSidebarPhaseListItemChildren_meeting$key
}

const RetroSidebarPhaseListItemChildren = (props: Props) => {
  const {gotoStageId, handleMenuClick, phaseType, meeting: meetingRef} = props
  const meeting = useFragment(
    graphql`
      fragment RetroSidebarPhaseListItemChildren_meeting on RetrospectiveMeeting {
        ...MeetingSidebarTeamMemberStageItems_meeting
        ...RetroSidebarDiscussSection_meeting
        ...RetroSidebarTeamHealthSection_meeting
        phases {
          phaseType
          stages {
            isComplete
          }
        }
      }
    `,
    meetingRef
  )
  const {phases} = meeting
  const showDiscussSection = phases && isPhaseComplete('vote', phases)
  if (phaseType === 'checkin' || phaseType === 'updates') {
    return (
      <MeetingSidebarTeamMemberStageItems
        gotoStageId={gotoStageId}
        handleMenuClick={handleMenuClick}
        meeting={meeting}
        phaseType={phaseType}
      />
    )
  } else if (phaseType === 'TEAM_HEALTH') {
    return (
      <RetroSidebarTeamHealthSection
        gotoStageId={gotoStageId}
        handleMenuClick={handleMenuClick}
        meeting={meeting}
      />
    )
  } else if (phaseType === 'discuss' && showDiscussSection) {
    return (
      <RetroSidebarDiscussSection
        gotoStageId={gotoStageId}
        handleMenuClick={handleMenuClick}
        meeting={meeting}
      />
    )
  }
  return null
}

export default RetroSidebarPhaseListItemChildren
