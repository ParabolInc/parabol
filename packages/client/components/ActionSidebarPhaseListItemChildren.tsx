import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
import {ActionSidebarPhaseListItemChildren_meeting$key} from '~/__generated__/ActionSidebarPhaseListItemChildren_meeting.graphql'
import useGotoStageId from '../hooks/useGotoStageId'
import {NewMeetingPhaseTypeEnum} from '../__generated__/ActionSidebarAgendaItemsSection_meeting.graphql'
import ActionSidebarAgendaItemsSection from './ActionSidebarAgendaItemsSection'
import MeetingSidebarTeamMemberStageItems from './MeetingSidebarTeamMemberStageItems'

interface Props {
  gotoStageId: ReturnType<typeof useGotoStageId>
  handleMenuClick: () => void
  phaseType: NewMeetingPhaseTypeEnum
  meeting: ActionSidebarPhaseListItemChildren_meeting$key
}

const teamMemberPhases: NewMeetingPhaseTypeEnum[] = ['checkin', 'updates']

const ActionSidebarPhaseListItemChildren = (props: Props) => {
  const {gotoStageId, handleMenuClick, phaseType, meeting: meetingRef} = props
  const meeting = useFragment(
    graphql`
      fragment ActionSidebarPhaseListItemChildren_meeting on ActionMeeting {
        ...MeetingSidebarTeamMemberStageItems_meeting
        ...ActionSidebarAgendaItemsSection_meeting
      }
    `,
    meetingRef
  )
  if (teamMemberPhases.includes(phaseType)) {
    return (
      <MeetingSidebarTeamMemberStageItems
        phaseType={phaseType}
        gotoStageId={gotoStageId}
        handleMenuClick={handleMenuClick}
        meeting={meeting}
      />
    )
  }
  if (phaseType === 'agendaitems') {
    return (
      <ActionSidebarAgendaItemsSection
        gotoStageId={gotoStageId}
        handleMenuClick={handleMenuClick}
        meeting={meeting}
      />
    )
  }
  return null
}

export default ActionSidebarPhaseListItemChildren
