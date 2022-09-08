import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useTranslation} from 'react-i18next'
import {createFragmentContainer} from 'react-relay'
import EndCheckInMutation from '~/mutations/EndCheckInMutation'
import useAtmosphere from '../hooks/useAtmosphere'
import useMutationProps from '../hooks/useMutationProps'
import useRouter from '../hooks/useRouter'
import AgendaShortcutHint from '../modules/meeting/components/AgendaShortcutHint/AgendaShortcutHint'
import MeetingCopy from '../modules/meeting/components/MeetingCopy/MeetingCopy'
import MeetingFacilitationHint from '../modules/meeting/components/MeetingFacilitationHint/MeetingFacilitationHint'
import MeetingPhaseHeading from '../modules/meeting/components/MeetingPhaseHeading/MeetingPhaseHeading'
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

  const {t} = useTranslation()

  const atmosphere = useAtmosphere()
  const {history} = useRouter()
  const {submitting, onError, onCompleted, submitMutation} = useMutationProps()
  const {viewerId} = atmosphere
  const {endedAt, facilitator, facilitatorUserId, id: meetingId, phases, showSidebar} = meeting
  const agendaItemPhase = phases.find((phase) => phase.phaseType === 'agendaitems')!
  const {stages} = agendaItemPhase
  const agendaItemsCompleted = stages.filter((stage) => stage.isComplete).length
  const {preferredName} = facilitator
  const isFacilitating = facilitatorUserId === viewerId && !endedAt
  const labelAgendaItems = plural(0, AGENDA_ITEM_LABEL)
  const endMeeting = () => {
    if (submitting) return
    submitMutation()
    EndCheckInMutation(atmosphere, {meetingId}, {history, onError, onCompleted})
  }

  const getHeadingText = () => {
    if (endedAt && agendaItemsCompleted === 0)
      return <span>{t('ActionMeetingLastCall.NothingToSeeHere')}</span>
    else if (agendaItemsCompleted === 0)
      return (
        <span>
          {t('ActionMeetingLastCall.NoLabelAgendaItems', {
            labelAgendaItems
          })}
        </span>
      )
    else return <span>{t('ActionMeetingLastCall.LastCall')}</span>
  }

  const getMeetingCopy = () => {
    if (endedAt && agendaItemsCompleted === 0) {
      return (
        <span>
          {t('ActionMeetingLastCall.ThereWereNoLabelAgendaItemsAddedToThisMeeting', {
            labelAgendaItems
          })}
        </span>
      )
    } else if (agendaItemsCompleted === 0) {
      return (
        <span>
          {t('ActionMeetingLastCall.LooksLikeYouDidntProcessAnyLabelAgendaItems', {
            labelAgendaItems
          })}
          <br />
          {t(
            'ActionMeetingLastCall.YouCanAddLabelAgendaItemsInTheLeftSidebarBeforeEndingTheMeeting',
            {
              labelAgendaItems
            }
          )}
          <br />
          {t('ActionMeetingLastCall.SimplyTapOnAnyItemsYouCreateToProcessThem')}
        </span>
      )
    } else {
      return (
        <span>
          {t('ActionMeetingLastCall.WeveWorkedOn')}
          <b>
            {t(
              'ActionMeetingLastCall.AgendaItemsCompletedPluralAgendaItemsCompletedAgendaItemLabel',
              {
                agendaItemsCompleted,
                pluralAgendaItemsCompletedAgendaItemLabel: plural(
                  agendaItemsCompleted,
                  AGENDA_ITEM_LABEL
                )
              }
            )}
          </b>
          {t('ActionMeetingLastCall.SoFarNeedAnythingElse')}
        </span>
      )
    }
  }

  return (
    <MeetingContent>
      <MeetingTopBar
        avatarGroup={avatarGroup}
        isMeetingSidebarCollapsed={!showSidebar}
        toggleSidebar={toggleSidebar}
      >
        <PhaseHeaderTitle>{phaseLabelLookup.agendaitems}</PhaseHeaderTitle>
      </MeetingTopBar>
      <ErrorBoundary>
        <LastCallWrapper>
          <MeetingPhaseHeading>{getHeadingText()}</MeetingPhaseHeading>
          <MeetingCopy>{getMeetingCopy()}</MeetingCopy>
          {!endedAt && <AgendaShortcutHint />}
          {isFacilitating ? (
            <PrimaryButton
              aria-label={t('ActionMeetingLastCall.EndMeeting')}
              size='large'
              onClick={endMeeting}
              disabled={!!endedAt}
            >
              {t('ActionMeetingLastCall.EndCheckInMeeting')}
            </PrimaryButton>
          ) : !endedAt ? (
            <MeetingFacilitationHint>
              {t('ActionMeetingLastCall.WaitingFor')} <b>{preferredName}</b>{' '}
              {t('ActionMeetingLastCall.ToEndTheMeeting', {})}
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
