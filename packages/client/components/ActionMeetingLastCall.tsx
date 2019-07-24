import {ActionMeetingLastCall_team} from '../__generated__/ActionMeetingLastCall_team.graphql'
import React from 'react'
import styled from '@emotion/styled'
import {createFragmentContainer, graphql} from 'react-relay'
import {ActionMeetingPhaseProps} from './ActionMeeting'
import ErrorBoundary from './ErrorBoundary'
import MeetingContent from './MeetingContent'
import MeetingContentHeader from './MeetingContentHeader'
import MeetingHelpToggle from './MenuHelpToggle'
import useAtmosphere from '../hooks/useAtmosphere'
import AgendaShortcutHint from '../modules/meeting/components/AgendaShortcutHint/AgendaShortcutHint'
import MeetingCopy from '../modules/meeting/components/MeetingCopy/MeetingCopy'
import MeetingFacilitationHint from '../modules/meeting/components/MeetingFacilitationHint/MeetingFacilitationHint'
import MeetingPhaseHeading from '../modules/meeting/components/MeetingPhaseHeading/MeetingPhaseHeading'
import {AGENDA_ITEM_LABEL} from '../utils/constants'
import lazyPreload from '../utils/lazyPreload'
import PrimaryButton from './PrimaryButton'
import EndNewMeetingMutation from '../mutations/EndNewMeetingMutation'
import useRouter from '../hooks/useRouter'
import {NewMeetingPhaseTypeEnum} from '../types/graphql'
import plural from '../utils/plural'
import useMutationProps from '../hooks/useMutationProps'

interface Props extends ActionMeetingPhaseProps {
  team: ActionMeetingLastCall_team
}

const ActionMeetingLastCallHelpMenu = lazyPreload(async () =>
  import(
    /* webpackChunkName: 'ActionMeetingLastCallHelpMenu' */ './MeetingHelp/ActionMeetingLastCallHelpMenu'
  )
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
  const {submitting, onError, onCompleted, submitMutation} = useMutationProps()
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
    if (submitting) return
    submitMutation()
    EndNewMeetingMutation(atmosphere, {meetingId}, {history, onError, onCompleted})
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
