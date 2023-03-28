import styled from '@emotion/styled'
import {Close} from '@mui/icons-material'
import graphql from 'babel-plugin-relay/macro'
import React, {useMemo, useState} from 'react'
import {useFragment} from 'react-relay'
import {RRule} from 'rrule'
import UpdateRecurrenceSettingsMutation from '~/mutations/UpdateRecurrenceSettingsMutation'
import {UpdateRecurrenceSettingsModal_meeting$key} from '~/__generated__/UpdateRecurrenceSettingsModal_meeting.graphql'
import useAtmosphere from '../../../hooks/useAtmosphere'
import useMutationProps, {getOnCompletedError} from '../../../hooks/useMutationProps'
import {PALETTE} from '../../../styles/paletteV3'
import {CompletedHandler} from '../../../types/relayMutations'
import {UpdateRecurrenceSettingsMutationResponse} from '../../../__generated__/UpdateRecurrenceSettingsMutation.graphql'
import DialogContainer from '../../DialogContainer'
import PlainButton from '../../PlainButton/PlainButton'
import {RecurrenceSettings} from './RecurrenceSettings'

const UpdateRecurrenceSettingsModalRoot = styled(DialogContainer)({
  backgroundColor: PALETTE.WHITE,
  position: 'relative',
  width: 400
})

const StyledCloseButton = styled(PlainButton)({
  position: 'absolute',
  height: 24,
  top: 0,
  right: 0,
  margin: 16
})

const CloseIcon = styled(Close)({
  color: PALETTE.SLATE_600,
  cursor: 'pointer',
  '&:hover': {
    opacity: 0.5
  }
})

const ActionsContainer = styled('div')({
  display: 'flex',
  justifyContent: 'flex-end',
  padding: 16
})

const ActionButton = styled(PlainButton)({
  height: 36,
  padding: '0px 16px',
  textAlign: 'center',
  borderRadius: 32
})

const UpdateButton = styled(ActionButton)({
  backgroundColor: PALETTE.SKY_500,
  color: PALETTE.WHITE,
  '&:hover': {
    backgroundColor: PALETTE.SKY_600
  },
  ':focus, :focus-visible, :active': {
    outline: `1px solid ${PALETTE.SKY_600}`,
    outlineOffset: 1
  }
})

const StopButton = styled(ActionButton)({
  color: PALETTE.SKY_500,
  marginRight: '16px',
  border: `1px solid ${PALETTE.SLATE_400}`,
  '&:hover': {
    backgroundColor: PALETTE.SLATE_100
  },
  ':focus, :focus-visible, :active': {
    outline: `1px solid ${PALETTE.SLATE_300}`,
    outlineOffset: 1
  }
})

const ErrorContainer = styled('div')({
  color: PALETTE.TOMATO_500,
  padding: '0px 16px 16px 16px'
})

interface Props {
  meeting: UpdateRecurrenceSettingsModal_meeting$key
  closeModal: () => void
}

export const UpdateRecurrenceSettingsModal = (props: Props) => {
  const {closeModal, meeting: meetingRef} = props

  const meeting = useFragment(
    graphql`
      fragment UpdateRecurrenceSettingsModal_meeting on TeamPromptMeeting {
        id
        meetingSeries {
          id
          title
          recurrenceRule
          cancelledAt
        }
      }
    `,
    meetingRef
  )

  const currentRecurrenceRule = meeting.meetingSeries?.recurrenceRule
  const atmosphere = useAtmosphere()
  const isMeetingSeriesActive = meeting.meetingSeries?.cancelledAt === null
  const [newRecurrenceSettings, setNewRecurrenceSettings] = useState<RecurrenceSettings>(() => ({
    name: meeting.meetingSeries?.title || '',
    rrule:
      isMeetingSeriesActive && currentRecurrenceRule
        ? RRule.fromString(currentRecurrenceRule)
        : null
  }))

  const {submitting, onError, onCompleted, submitMutation, error} = useMutationProps()
  const onRecurrenceSettingsUpdated: CompletedHandler<UpdateRecurrenceSettingsMutationResponse> = (
    res,
    errors
  ) => {
    onCompleted(res as any, errors)
    const error = getOnCompletedError(res as any, errors)
    if (error) {
      return
    }

    atmosphere.eventEmitter.emit('addSnackbar', {
      key: 'recurrenceSettingsUpdated',
      message: '🎉 Recurrence settings have been updated.',
      autoDismiss: 10,
      showDismissButton: true
    })
    closeModal()
  }

  const onUpdateRecurrenceClicked = () => {
    if (submitting) return
    submitMutation()

    UpdateRecurrenceSettingsMutation(
      atmosphere,
      {
        meetingId: meeting.id,
        recurrenceSettings: {
          rrule: newRecurrenceSettings.rrule?.toString(),
          name: newRecurrenceSettings.name
        }
      },
      {onError, onCompleted: onRecurrenceSettingsUpdated}
    )
  }

  const onStopRecurrence = () => {
    if (submitting) return
    submitMutation()

    UpdateRecurrenceSettingsMutation(
      atmosphere,
      {meetingId: meeting.id, recurrenceSettings: {rrule: null}},
      {onError, onCompleted: onRecurrenceSettingsUpdated}
    )
  }

  const canUpdate = useMemo(() => {
    const isRecurrenceReenabled = !isMeetingSeriesActive && newRecurrenceSettings.rrule
    if (isRecurrenceReenabled) return true

    const hasRecurrenceSettingsChanged =
      isMeetingSeriesActive && currentRecurrenceRule !== newRecurrenceSettings.rrule?.toString()
    if (hasRecurrenceSettingsChanged) return true

    const hasNameChanged =
      isMeetingSeriesActive && meeting.meetingSeries?.title !== newRecurrenceSettings.name
    if (hasNameChanged) return true

    return false
  }, [meeting, newRecurrenceSettings, currentRecurrenceRule, isMeetingSeriesActive])

  return (
    <UpdateRecurrenceSettingsModalRoot>
      <RecurrenceSettings
        parentId='updateRecurrenceSettingsModal'
        recurrenceSettings={newRecurrenceSettings}
        onRecurrenceSettingsUpdated={setNewRecurrenceSettings}
      />
      <StyledCloseButton onClick={closeModal}>
        <CloseIcon />
      </StyledCloseButton>
      <ActionsContainer>
        {isMeetingSeriesActive && (
          <StopButton onClick={onStopRecurrence}>Stop Recurrence</StopButton>
        )}
        <UpdateButton onClick={onUpdateRecurrenceClicked} disabled={!canUpdate}>
          Update
        </UpdateButton>
      </ActionsContainer>
      {error && <ErrorContainer>{error.message}</ErrorContainer>}
    </UpdateRecurrenceSettingsModalRoot>
  )
}
