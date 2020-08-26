import graphql from 'babel-plugin-relay/macro'
import React, { useMemo } from 'react'
import { createFragmentContainer } from 'react-relay'

import {
    ActionSidebarAgendaItemsSection_meeting
} from '../__generated__/ActionSidebarAgendaItemsSection_meeting.graphql'
import useGotoStageId from '../hooks/useGotoStageId'
import AgendaListAndInput from '../modules/teamDashboard/components/AgendaListAndInput/AgendaListAndInput'
import { NewMeetingPhaseTypeEnum } from '../types/graphql'
import MeetingSidebarPhaseItemChild from './MeetingSidebarPhaseItemChild'

interface Props {
  gotoStageId: ReturnType<typeof useGotoStageId>
  handleMenuClick: () => void
  meeting: ActionSidebarAgendaItemsSection_meeting
}

const ActionSidebarAgendaItemsSection = (props: Props) => {
  const {gotoStageId, handleMenuClick, meeting} = props
  const {team} = meeting
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
  const agendaItems = useMemo(() => {
    if (!agendaItemsPhase.stages) return null
    return agendaItemsPhase.stages.map((stage) => stage.agendaItem)
  }, [agendaItemsPhase])

  return (
    <MeetingSidebarPhaseItemChild>
      <AgendaListAndInput
        agendaItems={agendaItems}
        meeting={meeting}
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
        isNavigable
      }
    }
    ... on AgendaItemsPhase {
      stages {
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
      endedAt
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
