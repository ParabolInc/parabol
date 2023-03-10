import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
import useGotoStageId from '~/hooks/useGotoStageId'
import {
  NewMeetingPhaseTypeEnum,
  RetroSidebarPhaseListItemChildren_meeting$key
} from '~/__generated__/RetroSidebarPhaseListItemChildren_meeting.graphql'
import isPhaseComplete from '../utils/meetings/isPhaseComplete'
import MeetingSidebarTeamMemberStageItems from './MeetingSidebarTeamMemberStageItems'
import RetroSidebarDiscussSection from './RetroSidebarDiscussSection'

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
  if (phaseType === 'checkin') {
    return (
      <MeetingSidebarTeamMemberStageItems
        gotoStageId={gotoStageId}
        handleMenuClick={handleMenuClick}
        meeting={meeting}
        phaseType={phaseType}
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
