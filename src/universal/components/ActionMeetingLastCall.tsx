import {ActionMeetingLastCall_team} from '__generated__/ActionMeetingLastCall_team.graphql'
import React from 'react'
import styled from 'react-emotion'
import {createFragmentContainer, graphql} from 'react-relay'
import {ActionMeetingPhaseProps} from 'universal/components/ActionMeeting'
import ErrorBoundary from 'universal/components/ErrorBoundary'
import MeetingContent from 'universal/components/MeetingContent'
import MeetingContentHeader from 'universal/components/MeetingContentHeader'
import MeetingHelpToggle from 'universal/components/MenuHelpToggle'
import useAtmosphere from 'universal/hooks/useAtmosphere'
import AgendaShortcutHint from 'universal/modules/meeting/components/AgendaShortcutHint/AgendaShortcutHint'
import MeetingCopy from 'universal/modules/meeting/components/MeetingCopy/MeetingCopy'
import MeetingFacilitationHint from 'universal/modules/meeting/components/MeetingFacilitationHint/MeetingFacilitationHint'
import MeetingPhaseHeading from 'universal/modules/meeting/components/MeetingPhaseHeading/MeetingPhaseHeading'
import {AGENDA_ITEM_LABEL} from 'universal/utils/constants'
import lazyPreload from 'universal/utils/lazyPreload'
import PrimaryButton from 'universal/components/PrimaryButton'
import EndNewMeetingMutation from 'universal/mutations/EndNewMeetingMutation'
import useRouter from 'universal/hooks/useRouter'
import {NewMeetingPhaseTypeEnum} from 'universal/types/graphql'
import plural from 'universal/utils/plural'

interface Props extends ActionMeetingPhaseProps {
  team: ActionMeetingLastCall_team
}

const ActionMeetingLastCallHelpMenu = lazyPreload(async () =>
  import(/* webpackChunkName: 'ActionMeetingLastCallHelpMenu' */ 'universal/components/MeetingHelp/ActionMeetingLastCallHelpMenu')
)

const LastCallWrapper = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  justifyContent: 'center',
  marginLeft: 64,
  height: '100%'
})

const ActionMeetingLastCall = (props: Props) => {
  const {avatarGroup, toggleSidebar, team} = props
  const atmosphere = useAtmosphere()
  const {history} = useRouter()
  const {viewerId} = atmosphere
  const {isMeetingSidebarCollapsed, newMeeting} = team
  const {facilitator, facilitatorUserId, id: meetingId, phases} = newMeeting!
  const agendaItemPhase = phases.find(
    (phase) => phase.phaseType === NewMeetingPhaseTypeEnum.agendaitems
  )!
  const {stages} = agendaItemPhase
  const agendaItemsCompleted = stages.filter((stage) => stage.isComplete).length
  const {preferredName} = facilitator
  const isFacilitating = facilitatorUserId === viewerId
  const labelAgendaItems = plural(0, AGENDA_ITEM_LABEL)
  const endMeeting = () => {
    EndNewMeetingMutation(atmosphere, {meetingId}, {history})
  }
  return (
    <MeetingContent>
      <MeetingContentHeader
        avatarGroup={avatarGroup}
        isMeetingSidebarCollapsed={!!isMeetingSidebarCollapsed}
        toggleSidebar={toggleSidebar}
      />
      <ErrorBoundary>
        <LastCallWrapper>
          <MeetingPhaseHeading>
            {agendaItemsCompleted === 0 ? (
              <span>{`No ${labelAgendaItems}?`}</span>
            ) : (
              <span>{'Last Call:'}</span>
            )}
          </MeetingPhaseHeading>
          {agendaItemsCompleted === 0 ? (
            <MeetingCopy>
              <span>
                {`Looks like you didn’t process any ${labelAgendaItems}.`}
                <br />
                {`You can add ${labelAgendaItems} in the left sidebar before ending the meeting.`}
                <br />
                {'Simply tap on any items you create to process them.'}
              </span>
            </MeetingCopy>
          ) : (
            <MeetingCopy>
              {'We’ve worked on '}
              <b>{`${agendaItemsCompleted} ${plural(agendaItemsCompleted, AGENDA_ITEM_LABEL)}`}</b>
              {' so far—need anything else?'}
            </MeetingCopy>
          )}
          <AgendaShortcutHint />

          {isFacilitating ? (
            <PrimaryButton aria-label='End Meeting' size='large' onClick={endMeeting}>
              End Action Meeting
            </PrimaryButton>
          ) : (
            <MeetingFacilitationHint>
              {'Waiting for'} <b>{preferredName}</b> {`to end the meeting`}
            </MeetingFacilitationHint>
          )}
        </LastCallWrapper>
      </ErrorBoundary>
      <MeetingHelpToggle menu={<ActionMeetingLastCallHelpMenu />} />
    </MeetingContent>
  )
}

export default createFragmentContainer(ActionMeetingLastCall, {
  team: graphql`
    fragment ActionMeetingLastCall_team on Team {
      id
      isMeetingSidebarCollapsed
      newMeeting {
        id
        facilitatorUserId
        facilitator {
          preferredName
        }
        phases {
          phaseType
          stages {
            isComplete
          }
        }
      }
    }
  `
})
