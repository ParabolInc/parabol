import {ActionSidebarAgendaItemsSection_viewer} from '../__generated__/ActionSidebarAgendaItemsSection_viewer.graphql'
import React from 'react'
import {createFragmentContainer, graphql} from 'react-relay'
import LabelHeading from './LabelHeading/LabelHeading'
import MeetingSidebarLabelBlock from './MeetingSidebarLabelBlock'
import {useGotoStageId} from '../hooks/useMeeting'
import AgendaListAndInput from '../modules/teamDashboard/components/AgendaListAndInput/AgendaListAndInput'
import {NewMeetingPhaseTypeEnum} from '../types/graphql'
import UNSTARTED_MEETING from '../utils/meetings/unstartedMeeting'
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
  const {localPhase} = newMeeting || UNSTARTED_MEETING
  const phaseType = localPhase ? localPhase.phaseType : null

  const handleClick = async (stageId: string) => {
    gotoStageId(stageId).catch()
    handleMenuClick()
  }
  return (
    <MeetingSidebarPhaseItemChild>
      <MeetingSidebarLabelBlock>
        <LabelHeading>{'Agenda Topics'}</LabelHeading>
      </MeetingSidebarLabelBlock>
      <AgendaListAndInput
        isMeeting
        gotoStageId={handleClick}
        isDisabled={phaseType === NewMeetingPhaseTypeEnum.checkin}
        team={team!}
      />
    </MeetingSidebarPhaseItemChild>
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
