import styled from '@emotion/styled'
import {Close} from '@mui/icons-material'
import graphql from 'babel-plugin-relay/macro'
import {ChangeEvent, useMemo, useState} from 'react'
import {useFragment} from 'react-relay'
import {RRule} from 'rrule'
import {UpdateRecurrenceSettingsModal_meeting$key} from '~/__generated__/UpdateRecurrenceSettingsModal_meeting.graphql'
import UpdateRecurrenceSettingsMutation from '~/mutations/UpdateRecurrenceSettingsMutation'
import {UpdateRecurrenceSettingsMutation as TUpdateRecurrenceSettingsMutation} from '../../__generated__/UpdateRecurrenceSettingsMutation.graphql'
import useAtmosphere from '../../hooks/useAtmosphere'
import useForm from '../../hooks/useForm'
import useMutationProps, {getOnCompletedError} from '../../hooks/useMutationProps'
import {PALETTE} from '../../styles/paletteV3'
import {CompletedHandler} from '../../types/relayMutations'
import Legitity from '../../validation/Legitity'
import DialogContainer from '../DialogContainer'
import PlainButton from '../PlainButton/PlainButton'
import StyledError from '../StyledError'
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

const validateTitle = (title: string) =>
  new Legitity(title).trim().min(2, `C’mon, you call that a title?`)

interface Props {
  meeting: UpdateRecurrenceSettingsModal_meeting$key
  closeModal: () => void
}

export const UpdateRecurrenceSettingsModal = (props: Props) => {
  const {closeModal, meeting: meetingRef} = props

  const meeting = useFragment(
    graphql`
      fragment UpdateRecurrenceSettingsModal_meeting on NewMeeting {
        id
        meetingType
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

  const {meetingType} = meeting
  const placeholder =
    meetingType === 'teamPrompt'
      ? 'Standup'
      : meetingType === 'retrospective'
        ? 'Retrospective'
        : 'Meeting'
  const currentRecurrenceRule = meeting.meetingSeries?.recurrenceRule
  const atmosphere = useAtmosphere()
  const isMeetingSeriesActive = meeting.meetingSeries?.cancelledAt === null

  const [rrule, setRrule] = useState<RRule | null>(
    isMeetingSeriesActive && currentRecurrenceRule ? RRule.fromString(currentRecurrenceRule) : null
  )

  const {submitting, onError, onCompleted, submitMutation, error} = useMutationProps()
  const onRecurrenceSettingsUpdated: CompletedHandler<
    TUpdateRecurrenceSettingsMutation['response']
  > = (res, errors) => {
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

  const {fields, onChange} = useForm({
    title: {
      getDefault: () => meeting.meetingSeries?.title || ''
    }
  })
  const title = fields.title.value
  const titleErr = fields.title.error

  const onNameChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (titleErr) {
      fields.title.setError('')
    }
    onChange(event)
  }

  const onUpdateRecurrenceClicked = () => {
    if (submitting) return

    const title = fields.title.value || placeholder
    const titleRes = validateTitle(title)
    if (titleRes.error) {
      fields.title.setError(titleRes.error)
      return
    }

    submitMutation()

    UpdateRecurrenceSettingsMutation(
      atmosphere,
      {
        meetingId: meeting.id,
        rrule: rrule?.toString(),
        name: title
      },
      {onError, onCompleted: onRecurrenceSettingsUpdated}
    )
  }

  const onStopRecurrence = () => {
    if (submitting) return
    submitMutation()

    UpdateRecurrenceSettingsMutation(
      atmosphere,
      {meetingId: meeting.id, rrule: null},
      {onError, onCompleted: onRecurrenceSettingsUpdated}
    )
  }

  const canUpdate = useMemo(() => {
    const title = fields.title.value || placeholder
    const titleRes = validateTitle(title)
    if (titleRes.error) {
      fields.title.setError(titleRes.error)
      return
    }

    const isRecurrenceReenabled = !isMeetingSeriesActive && rrule
    if (isRecurrenceReenabled) return true

    const hasRecurrenceSettingsChanged =
      isMeetingSeriesActive && currentRecurrenceRule !== rrule?.toString()
    if (hasRecurrenceSettingsChanged) return true

    const hasNameChanged = isMeetingSeriesActive && meeting.meetingSeries?.title !== title
    if (hasNameChanged) return true

    return false
  }, [meeting, title, rrule, currentRecurrenceRule, isMeetingSeriesActive])

  return (
    <UpdateRecurrenceSettingsModalRoot>
      <input
        className='form-input border-none p-4 font-sans text-base outline-hidden focus:ring-1 focus:ring-slate-600 focus:outline-hidden'
        type='text'
        name='title'
        placeholder={placeholder}
        value={title}
        onChange={onNameChange}
        min={1}
        max={50}
      />
      {titleErr && <StyledError>{titleErr}</StyledError>}
      <RecurrenceSettings title={title} rrule={rrule} onRruleUpdated={setRrule} />
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
