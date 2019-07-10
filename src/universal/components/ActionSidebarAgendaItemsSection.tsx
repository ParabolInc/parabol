import {ActionSidebarAgendaItemsSection_viewer} from '__generated__/ActionSidebarAgendaItemsSection_viewer.graphql'
import React from 'react'
import styled from 'react-emotion'
import {createFragmentContainer, graphql} from 'react-relay'
import LabelHeading from 'universal/components/LabelHeading/LabelHeading'
import MeetingSidebarLabelBlock from 'universal/components/MeetingSidebarLabelBlock'
import {useGotoStageId} from 'universal/hooks/useMeeting'
import AgendaListAndInput from 'universal/modules/teamDashboard/components/AgendaListAndInput/AgendaListAndInput'
import {NewMeetingPhaseTypeEnum} from 'universal/types/graphql'
import UNSTARTED_MEETING from 'universal/utils/meetings/unstartedMeeting'

interface Props {
  gotoStageId: ReturnType<typeof useGotoStageId>
  handleMenuClick: () => void
  viewer: ActionSidebarAgendaItemsSection_viewer
}

const SidebarPhaseItemChild = styled('div')({
  display: 'flex',
  flexDirection: 'column'
})

const ActionSidebarAgendaItemsSection = (props: Props) => {
  const {
    gotoStageId,
    handleMenuClick,
    viewer: {team}
  } = props
  const {newMeeting} = team!
  const {localPhase} = newMeeting || UNSTARTED_MEETING
  const phaseType = localPhase ? localPhase.phaseType : null

  const handleClick = async (stageId: string) => {
    gotoStageId(stageId).catch()
    handleMenuClick()
  }
  return (
    <SidebarPhaseItemChild>
      <MeetingSidebarLabelBlock>
        <LabelHeading>{'Agenda Topics'}</LabelHeading>
      </MeetingSidebarLabelBlock>
      <AgendaListAndInput
        gotoStageId={handleClick}
        isDisabled={phaseType === NewMeetingPhaseTypeEnum.checkin}
        team={team!}
      />
    </SidebarPhaseItemChild>
  )
}

graphql`
  fragment ActionSidebarAgendaItemsSectionAgendaItemPhase on NewMeetingPhase {
    phaseType
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
