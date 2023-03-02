import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
import useGotoStageId from '../hooks/useGotoStageId'
import AgendaListAndInput from '../modules/teamDashboard/components/AgendaListAndInput/AgendaListAndInput'
import {ActionSidebarAgendaItemsSection_meeting$key} from '../__generated__/ActionSidebarAgendaItemsSection_meeting.graphql'
import MeetingSidebarPhaseItemChild from './MeetingSidebarPhaseItemChild'

const StyledRoot = styled(MeetingSidebarPhaseItemChild)({
  overflow: 'visible',
  minHeight: 'fit-content'
})

interface Props {
  gotoStageId: ReturnType<typeof useGotoStageId>
  handleMenuClick: () => void
  meeting: ActionSidebarAgendaItemsSection_meeting$key
}

const ActionSidebarAgendaItemsSection = (props: Props) => {
  const {gotoStageId, handleMenuClick, meeting: meetingRef} = props
  const meeting = useFragment(
    graphql`
      fragment ActionSidebarAgendaItemsSection_meeting on ActionMeeting {
        ...AgendaListAndInput_meeting
        phases {
          ...ActionSidebarAgendaItemsSectionAgendaItemPhase @relay(mask: false)
        }
        team {
          ...AgendaListAndInput_team
        }
      }
    `,
    meetingRef
  )
  const {team} = meeting
  const handleClick = async (stageId: string) => {
    gotoStageId(stageId).catch()
    handleMenuClick()
  }
  // show agenda (no blur) at all times if the updates phase isNavigable
  // facilitator can click on updates nav item before completing all check-in stages
  const updatesPhase = meeting.phases!.find((phase) => phase.phaseType === 'updates')!
  const isUpdatesNavigable = updatesPhase?.stages?.[0]?.isNavigable

  return (
    <StyledRoot>
      <AgendaListAndInput
        gotoStageId={handleClick}
        isDisabled={!isUpdatesNavigable}
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

export default ActionSidebarAgendaItemsSection
