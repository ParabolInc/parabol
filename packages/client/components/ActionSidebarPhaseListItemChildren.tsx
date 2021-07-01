import React from 'react'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import ActionSidebarAgendaItemsSection from './ActionSidebarAgendaItemsSection'
import MeetingSidebarTeamMemberStageItems from './MeetingSidebarTeamMemberStageItems'
import {NewMeetingPhaseTypeEnum} from '../__generated__/ActionSidebarAgendaItemsSection_meeting.graphql'
import {ActionSidebarPhaseListItemChildren_meeting} from '~/__generated__/ActionSidebarPhaseListItemChildren_meeting.graphql'
import useGotoStageId from '../hooks/useGotoStageId'

interface Props {
  gotoStageId: ReturnType<typeof useGotoStageId>
  handleMenuClick: () => void
  phaseType: NewMeetingPhaseTypeEnum
  meeting: ActionSidebarPhaseListItemChildren_meeting
}

const ActionSidebarPhaseListItemChildren = (props: Props) => {
  const {gotoStageId, handleMenuClick, phaseType, meeting} = props
  return (
    <>
      <MeetingSidebarTeamMemberStageItems
        gotoStageId={gotoStageId}
        handleMenuClick={handleMenuClick}
        meeting={meeting}
        phaseType={phaseType}
      />
      {phaseType === 'agendaitems' && (
        <ActionSidebarAgendaItemsSection
          gotoStageId={gotoStageId}
          handleMenuClick={handleMenuClick}
          meeting={meeting}
        />
      )}
    </>
  )
}

export default createFragmentContainer(ActionSidebarPhaseListItemChildren, {
  meeting: graphql`
    fragment ActionSidebarPhaseListItemChildren_meeting on ActionMeeting {
      ...MeetingSidebarTeamMemberStageItems_meeting
      localPhase {
        phaseType
      }
      ...ActionSidebarAgendaItemsSection_meeting
    }
  `
})
