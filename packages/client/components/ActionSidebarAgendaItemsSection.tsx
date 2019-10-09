import {ActionSidebarAgendaItemsSection_viewer} from '../__generated__/ActionSidebarAgendaItemsSection_viewer.graphql'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import {useGotoStageId} from '../hooks/useMeeting'
import AgendaListAndInput from '../modules/teamDashboard/components/AgendaListAndInput/AgendaListAndInput'
import {NewMeetingPhaseTypeEnum} from '../types/graphql'
import MeetingSidebarPhaseItemChild from './MeetingSidebarPhaseItemChild'

interface Props {
  gotoStageId: ReturnType<typeof useGotoStageId>
  handleMenuClick: () => void
  viewer: ActionSidebarAgendaItemsSection_viewer
}

const ActionSidebarAgendaItemsSection = (props: Props) => {
  const {
    gotoStageId,
    handleMenuClick,
    viewer: {team}
  } = props
  const {newMeeting} = team!
  const handleClick = async (stageId: string) => {
    gotoStageId(stageId).catch()
    handleMenuClick()
  }
  // show agenda (no blur) at all times if the updates phase isNavigable
  // facilitator can click on updates nav item before completing all check-in stages
  const updatesPhase = newMeeting && newMeeting.phases!.find((phase) => phase.phaseType === NewMeetingPhaseTypeEnum.updates)!
  const isUpdatesNavigable = updatesPhase && updatesPhase.stages![0].isNavigable
  return (
    <MeetingSidebarPhaseItemChild>
      <AgendaListAndInput
        isMeeting
        gotoStageId={handleClick}
        isDisabled={Boolean(newMeeting && !isUpdatesNavigable)}
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
      }
    }
  }
`

export default createFragmentContainer(ActionSidebarAgendaItemsSection, {
  viewer: graphql`
    fragment ActionSidebarAgendaItemsSection_viewer on User {
      team(teamId: $teamId) {
        ...AgendaListAndInput_team
        newMeeting {
          id
          localStage {
            id
          }
          ... on ActionMeeting {
            facilitatorStageId
            # load up the localPhase
            phases {
              ...ActionSidebarAgendaItemsSectionAgendaItemPhase @relay(mask: false)
            }
            localPhase {
              ...ActionSidebarAgendaItemsSectionAgendaItemPhase @relay(mask: false)
            }
          }
        }
      }
    }
  `
})
