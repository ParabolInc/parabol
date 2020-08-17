import {ActionSidebarAgendaItemsSection_meeting} from '../__generated__/ActionSidebarAgendaItemsSection_meeting.graphql'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import AgendaListAndInput from '../modules/teamDashboard/components/AgendaListAndInput/AgendaListAndInput'
import {NewMeetingPhaseTypeEnum} from '../types/graphql'
import MeetingSidebarPhaseItemChild from './MeetingSidebarPhaseItemChild'
import useGotoStageId from '../hooks/useGotoStageId'

interface Props {
  gotoStageId: ReturnType<typeof useGotoStageId>
  handleMenuClick: () => void
  meeting: ActionSidebarAgendaItemsSection_meeting
}

const ActionSidebarAgendaItemsSection = (props: Props) => {
  const {gotoStageId, handleMenuClick, meeting} = props
  const {id: meetingId, team} = meeting
  const handleClick = async (stageId: string) => {
    gotoStageId(stageId).catch()
    handleMenuClick()
  }
  // show agenda (no blur) at all times if the updates phase isNavigable
  // facilitator can click on updates nav item before completing all check-in stages
  const updatesPhase = meeting.phases!.find(
    (phase) => phase.phaseType === NewMeetingPhaseTypeEnum.updates
  )!
  const isUpdatesNavigable = updatesPhase && updatesPhase.stages![0].isNavigable
  const agendaItemsPhase = meeting.phases!.find(
    (phase) => phase.phaseType === NewMeetingPhaseTypeEnum.agendaitems
  )!
  const agendaItems =
    agendaItemsPhase.stages && agendaItemsPhase.stages.map((stage) => stage.agendaItem)
  return (
    <MeetingSidebarPhaseItemChild>
      <AgendaListAndInput
        agendaItems={agendaItems}
        meeting={meeting as any}
        meetingId={meetingId}
        gotoStageId={handleClick}
        isDisabled={!isUpdatesNavigable}
        team={team!}
      />
    </MeetingSidebarPhaseItemChild>
  )
}

graphql`
  fragment ActionSidebarAgendaItemsSectionAgendaItemPhase on NewMeetingPhase {
    id
    phaseType
    ... on UpdatesPhase {
      stages {
        id
        isComplete
        isNavigable
      }
    }
    ... on AgendaItemsPhase {
      stages {
        id
        isComplete
        isNavigable
        agendaItem {
          id
          content
          # need this for the DnD
          sortOrder
          ...AgendaItem_agendaItem
        }
      }
    }
  }
`

export default createFragmentContainer(ActionSidebarAgendaItemsSection, {
  meeting: graphql`
    fragment ActionSidebarAgendaItemsSection_meeting on ActionMeeting {
      ...AgendaListAndInput_meeting
      id
      localStage {
        id
      }
      facilitatorStageId
      facilitatorUserId
      meetingType
      # load up the localPhase
      phases {
        ...ActionSidebarAgendaItemsSectionAgendaItemPhase @relay(mask: false)
      }
      localPhase {
        ...ActionSidebarAgendaItemsSectionAgendaItemPhase @relay(mask: false)
      }
      team {
        ...AgendaListAndInput_team
      }
    }
  `
})
