import {ActionSidebarPhaseListItemChildren_viewer} from '../../__generated__/ActionSidebarPhaseListItemChildren_viewer.graphql'
import React from 'react'
import {createFragmentContainer, graphql} from 'react-relay'
import ActionSidebarAgendaItemsSection from './ActionSidebarAgendaItemsSection'
import {useGotoStageId} from '../hooks/useMeeting'
import {NewMeetingPhaseTypeEnum} from '../types/graphql'

interface Props {
  gotoStageId: ReturnType<typeof useGotoStageId>
  handleMenuClick: () => void
  phaseType: keyof typeof NewMeetingPhaseTypeEnum | string
  viewer: ActionSidebarPhaseListItemChildren_viewer
}

const ActionSidebarPhaseListItemChildren = (props: Props) => {
  const {gotoStageId, handleMenuClick, phaseType, viewer} = props
  if (phaseType === NewMeetingPhaseTypeEnum.agendaitems) {
    return (
      <ActionSidebarAgendaItemsSection
        gotoStageId={gotoStageId}
        handleMenuClick={handleMenuClick}
        viewer={viewer}
      />
    )
  }
  return null
}

export default createFragmentContainer(ActionSidebarPhaseListItemChildren, {
  viewer: graphql`
    fragment ActionSidebarPhaseListItemChildren_viewer on User {
      team(teamId: $teamId) {
        newMeeting {
          localPhase {
            phaseType
          }
        }
      }
      ...ActionSidebarAgendaItemsSection_viewer
    }
  `
})
