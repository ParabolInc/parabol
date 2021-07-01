import React from 'react'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import ActionSidebarAgendaItemsSection from './ActionSidebarAgendaItemsSection'
import MeetingSidebarTeamMemberStageItems from './MeetingSidebarTeamMemberStageItems'
import {NewMeetingPhaseTypeEnum} from '../__generated__/ActionSidebarAgendaItemsSection_meeting.graphql'
import {ActionSidebarPhaseListItemChildren_meeting} from '~/__generated__/ActionSidebarPhaseListItemChildren_meeting.graphql'
import useGotoStageId from '../hooks/useGotoStageId'
import {NavSidebar} from '../types/constEnums'

interface Props {
  gotoStageId: ReturnType<typeof useGotoStageId>
  handleMenuClick: () => void
  phaseType: NewMeetingPhaseTypeEnum
  meeting: ActionSidebarPhaseListItemChildren_meeting
  maxSidebarChildrenHeight: number
}

const ActionSidebarPhaseListItemChildren = (props: Props) => {
  const {gotoStageId, handleMenuClick, phaseType, meeting, maxSidebarChildrenHeight} = props
  const {localPhase, phases} = meeting
  const {phaseType: localPhaseType} = localPhase
  const stages = phases.find((stage) => stage.phaseType === localPhaseType)?.stages
  const stageCount = stages?.length || 0
  const memberStageMaxHeight = stageCount * NavSidebar.ITEM_HEIGHT
  const maxInactiveAgendaItemsHeight = Math.max(
    maxSidebarChildrenHeight - memberStageMaxHeight,
    NavSidebar.AGENDA_ITEM_INPUT_HEIGHT
  )
  const maxAgendaItemsHeight =
    localPhaseType === 'agendaitems' ? maxSidebarChildrenHeight : maxInactiveAgendaItemsHeight
  if (!maxSidebarChildrenHeight) return null
  if (phaseType === 'agendaitems') {
    return (
      <ActionSidebarAgendaItemsSection
        gotoStageId={gotoStageId}
        handleMenuClick={handleMenuClick}
        meeting={meeting}
        maxAgendaItemsHeight={maxAgendaItemsHeight}
      />
    )
  }
  return (
    <MeetingSidebarTeamMemberStageItems
      gotoStageId={gotoStageId}
      handleMenuClick={handleMenuClick}
      meeting={meeting}
      phaseType={phaseType}
      maxSidebarChildrenHeight={maxSidebarChildrenHeight}
    />
  )
}

export default createFragmentContainer(ActionSidebarPhaseListItemChildren, {
  meeting: graphql`
    fragment ActionSidebarPhaseListItemChildren_meeting on ActionMeeting {
      ...MeetingSidebarTeamMemberStageItems_meeting
      localPhase {
        phaseType
      }
      phases {
        phaseType
        stages {
          id
          phaseType
        }
      }
      ...ActionSidebarAgendaItemsSection_meeting
    }
  `
})
