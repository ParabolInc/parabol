import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import useAtmosphere from '../hooks/useAtmosphere'
import useMutationProps from '../hooks/useMutationProps'
import useRouter from '../hooks/useRouter'
import AgendaShortcutHint from '../modules/meeting/components/AgendaShortcutHint/AgendaShortcutHint'
import MeetingCopy from '../modules/meeting/components/MeetingCopy/MeetingCopy'
import MeetingFacilitationHint from '../modules/meeting/components/MeetingFacilitationHint/MeetingFacilitationHint'
import MeetingPhaseHeading from '../modules/meeting/components/MeetingPhaseHeading/MeetingPhaseHeading'
import EndNewMeetingMutation from '../mutations/EndNewMeetingMutation'
import {NewMeetingPhaseTypeEnum} from '../types/graphql'
import {AGENDA_ITEM_LABEL} from '../utils/constants'
import {phaseLabelLookup} from '../utils/meetings/lookups'
import plural from '../utils/plural'
import {ActionMeetingLastCall_meeting} from '../__generated__/ActionMeetingLastCall_meeting.graphql'
import {ActionMeetingPhaseProps} from './ActionMeeting'
import ErrorBoundary from './ErrorBoundary'
import MeetingContent from './MeetingContent'
import MeetingTopBar from './MeetingTopBar'
import PhaseHeaderTitle from './PhaseHeaderTitle'
import PrimaryButton from './PrimaryButton'

interface Props extends ActionMeetingPhaseProps {
  meeting: ActionMeetingLastCall_meeting
}

const LastCallWrapper = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  justifyContent: 'center',
  marginLeft: 64,
  height: '100%'
})

const ActionMeetingLastCall = (props: Props) => {
  const {avatarGroup, toggleSidebar, meeting} = props
  const atmosphere = useAtmosphere()
  const {history} = useRouter()
  const {submitting, onError, onCompleted, submitMutation} = useMutationProps()
  const {viewerId} = atmosphere
  const {endedAt, facilitator, facilitatorUserId, id: meetingId, phases, showSidebar} = meeting
  const agendaItemPhase = phases.find(
    (phase) => phase.phaseType === NewMeetingPhaseTypeEnum.agendaitems
  )!
  const {stages} = agendaItemPhase
  const agendaItemsCompleted = stages.filter((stage) => stage.isComplete).length
  const {preferredName} = facilitator
  const isFacilitating = facilitatorUserId === viewerId && !endedAt
  const labelAgendaItems = plural(0, AGENDA_ITEM_LABEL)
  const endMeeting = () => {
    if (submitting) return
    submitMutation()
    EndNewMeetingMutation(atmosphere, {meetingId}, {history, onError, onCompleted})
  }
  return (
    <MeetingContent>
      <MeetingTopBar
        avatarGroup={avatarGroup}
        isMeetingSidebarCollapsed={!showSidebar}
        toggleSidebar={toggleSidebar}
      >
        <PhaseHeaderTitle>{phaseLabelLookup[NewMeetingPhaseTypeEnum.agendaitems]}</PhaseHeaderTitle>
      </MeetingTopBar>
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
            <PrimaryButton
              aria-label='End Meeting'
              size='large'
              onClick={endMeeting}
              disabled={!!endedAt}
            >
              End Check-in Meeting
            </PrimaryButton>
          ) : !endedAt ? (
            <MeetingFacilitationHint>
              {'Waiting for'} <b>{preferredName}</b> {`to end the meeting`}
            </MeetingFacilitationHint>
          ) : null}
        </LastCallWrapper>
      </ErrorBoundary>
    </MeetingContent>
  )
}

export default createFragmentContainer(ActionMeetingLastCall, {
  meeting: graphql`
    fragment ActionMeetingLastCall_meeting on ActionMeeting {
      id
      endedAt
      showSidebar
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
  `
})
