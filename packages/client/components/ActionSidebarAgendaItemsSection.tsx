import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer} from 'react-relay'

import {ActionSidebarAgendaItemsSection_meeting} from '../__generated__/ActionSidebarAgendaItemsSection_meeting.graphql'
import useGotoStageId from '../hooks/useGotoStageId'
import AgendaListAndInput, {
  getAgendaItems
} from '../modules/teamDashboard/components/AgendaListAndInput/AgendaListAndInput'
import MeetingSidebarPhaseItemChild from './MeetingSidebarPhaseItemChild'
import {NavSidebar} from '../types/constEnums'

interface Props {
  gotoStageId: ReturnType<typeof useGotoStageId>
  handleMenuClick: () => void
  meeting: ActionSidebarAgendaItemsSection_meeting
  maxAgendaItemsHeight: number
}

const ActionSidebarAgendaItemsSection = (props: Props) => {
  const {gotoStageId, handleMenuClick, meeting, maxAgendaItemsHeight} = props
  const {team} = meeting
  const handleClick = async (stageId: string) => {
    gotoStageId(stageId).catch()
    handleMenuClick()
  }
  // show agenda (no blur) at all times if the updates phase isNavigable
  // facilitator can click on updates nav item before completing all check-in stages
  const updatesPhase = meeting.phases!.find((phase) => phase.phaseType === 'updates')!
  const isUpdatesNavigable = updatesPhase && updatesPhase.stages![0].isNavigable
  const agendaItems = getAgendaItems(meeting as any) || team.agendaItems
  const agendaItemCount = agendaItems.length
  const maxHeight = agendaItemCount * NavSidebar.ITEM_HEIGHT
  const childHeight = Math.min(maxAgendaItemsHeight, maxHeight)

  return (
    <MeetingSidebarPhaseItemChild isActive height={childHeight}>
      <AgendaListAndInput
        gotoStageId={handleClick}
        isDisabled={!isUpdatesNavigable}
        meeting={meeting}
        team={team!}
      />
    </MeetingSidebarPhaseItemChild>
  )
}

graphql`
  fragment ActionSidebarAgendaItemsSectionAgendaItemPhase on NewMeetingPhase {
    phaseType
    ... on UpdatesPhase {
      stages {
        isNavigable
      }
    }
  }
`

export default createFragmentContainer(ActionSidebarAgendaItemsSection, {
  meeting: graphql`
    fragment ActionSidebarAgendaItemsSection_meeting on ActionMeeting {
      ...AgendaListAndInput_meeting
      phases {
        ...ActionSidebarAgendaItemsSectionAgendaItemPhase @relay(mask: false)
        ... on AgendaItemsPhase {
          stages {
            agendaItem {
              id
            }
          }
        }
      }
      team {
        ...AgendaListAndInput_team
        agendaItems {
          id
        }
      }
    }
  `
})
