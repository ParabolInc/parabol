import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import useGotoStageId from '../hooks/useGotoStageId'
import AgendaListAndInput from '../modules/teamDashboard/components/AgendaListAndInput/AgendaListAndInput'
import {ActionSidebarAgendaItemsSection_meeting} from '../__generated__/ActionSidebarAgendaItemsSection_meeting.graphql'
import MeetingSidebarPhaseItemChild from './MeetingSidebarPhaseItemChild'

const StyledRoot = styled(MeetingSidebarPhaseItemChild)({
  overflow: 'visible',
  minHeight: 'fit-content'
})

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
  return (
    <StyledRoot>
      <AgendaListAndInput
        gotoStageId={handleClick}
        isDisabled={false}
        meeting={meeting}
        team={team!}
      />
    </StyledRoot>
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
      }
      team {
        ...AgendaListAndInput_team
      }
    }
  `
})
