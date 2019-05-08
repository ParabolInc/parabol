import {ActionSidebarPhaseListItemChildren_viewer} from '__generated__/ActionSidebarPhaseListItemChildren_viewer.graphql'
import React from 'react'
import {createFragmentContainer, graphql} from 'react-relay'
import ActionSidebarAgendaItemsSection from 'universal/components/ActionSidebarAgendaItemsSection'
import {useGotoStageId} from 'universal/hooks/useMeeting'
import {NewMeetingPhaseTypeEnum} from 'universal/types/graphql'

interface Props {
  gotoStageId: ReturnType<typeof useGotoStageId>
  phaseType: keyof typeof NewMeetingPhaseTypeEnum | string
  viewer: ActionSidebarPhaseListItemChildren_viewer
}

const ActionSidebarPhaseListItemChildren = (props: Props) => {
  const {gotoStageId, phaseType, viewer} = props
  if (phaseType === NewMeetingPhaseTypeEnum.agendaitems) {
    return <ActionSidebarAgendaItemsSection gotoStageId={gotoStageId} viewer={viewer} />
  }
  return null
}

export default createFragmentContainer(
  ActionSidebarPhaseListItemChildren,
  graphql`
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
)
