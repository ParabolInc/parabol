import React from 'react'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import MeetingSidebarTeamMemberStageItems from './MeetingSidebarTeamMemberStageItems'
import RetroSidebarDiscussSection from './RetroSidebarDiscussSection'
import isPhaseComplete from '../utils/meetings/isPhaseComplete'
import {NewMeetingPhaseTypeEnum} from '../types/graphql'
import useGotoStageId from '~/hooks/useGotoStageId'
import {RetroSidebarPhaseListItemChildren_meeting} from '~/__generated__/RetroSidebarPhaseListItemChildren_meeting.graphql'

interface Props {
  gotoStageId: ReturnType<typeof useGotoStageId>
  handleMenuClick: () => void
  phaseType: keyof typeof NewMeetingPhaseTypeEnum | string
  meeting: RetroSidebarPhaseListItemChildren_meeting
}

const RetroSidebarPhaseListItemChildren = (props: Props) => {
  const {gotoStageId, handleMenuClick, phaseType, meeting} = props
  const {phases, localPhase} = meeting
  const showCheckInSection = localPhase && localPhase.phaseType === phaseType
  const showDiscussSection = phases && isPhaseComplete(NewMeetingPhaseTypeEnum.vote, phases)
  if (phaseType === NewMeetingPhaseTypeEnum.checkin && showCheckInSection) {
    return (
      <MeetingSidebarTeamMemberStageItems
        gotoStageId={gotoStageId}
        handleMenuClick={handleMenuClick}
        meeting={meeting}
      />
    )
  }
  if (phaseType === NewMeetingPhaseTypeEnum.discuss && showDiscussSection) {
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

export default createFragmentContainer(RetroSidebarPhaseListItemChildren, {
  meeting: graphql`
    fragment RetroSidebarPhaseListItemChildren_meeting on RetrospectiveMeeting {
      ...MeetingSidebarTeamMemberStageItems_meeting
      ...RetroSidebarDiscussSection_meeting
      localPhase {
        phaseType
      }
      phases {
        phaseType
        stages {
          isComplete
        }
      }
    }
  `
})
