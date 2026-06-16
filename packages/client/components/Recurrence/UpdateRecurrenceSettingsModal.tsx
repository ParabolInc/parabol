import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import {type ChangeEvent, useMemo, useState} from 'react'
import {useFragment} from 'react-relay'
import {RRule} from 'rrule'
import type {UpdateRecurrenceSettingsModal_meeting$key} from '~/__generated__/UpdateRecurrenceSettingsModal_meeting.graphql'
import UpdateRecurrenceSettingsMutation from '~/mutations/UpdateRecurrenceSettingsMutation'
import type {UpdateRecurrenceSettingsMutation as TUpdateRecurrenceSettingsMutation} from '../../__generated__/UpdateRecurrenceSettingsMutation.graphql'
import useAtmosphere from '../../hooks/useAtmosphere'
import useForm from '../../hooks/useForm'
import useMutationProps, {getOnCompletedError} from '../../hooks/useMutationProps'
import {PALETTE} from '../../styles/paletteV3'
import type {CompletedHandler} from '../../types/relayMutations'
import {Dialog} from '../../ui/Dialog/Dialog'
import {DialogContent} from '../../ui/Dialog/DialogContent'
import Legitity from '../../validation/Legitity'
import PlainButton from '../PlainButton/PlainButton'
import StyledError from '../StyledError'
import {RecurrenceSettings} from './RecurrenceSettings'

const ActionsContainer = styled('div')({
  display: 'flex',
  justifyContent: 'flex-end',
  padding: '16px 0 0'
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

const validateTitle = (title: string) =>
  new Legitity(title).trim().min(2, `C'mon, you call that a title?`)

interface Props {
  isOpen: boolean
  meeting: UpdateRecurrenceSettingsModal_meeting$key
  closeModal: () => void
}

export const UpdateRecurrenceSettingsModal = (props: Props) => {
  const {isOpen, closeModal, meeting: meetingRef} = props

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
    onCompleted(res, errors)
    const error = getOnCompletedError(res, errors)
    if (error) return

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
    if (titleErr) fields.title.setError('')
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
      {meetingId: meeting.id, rrule: rrule?.toString(), name: title},
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
    <Dialog isOpen={isOpen} onClose={closeModal}>
      <DialogContent className='w-[420px] max-w-[95vw] md:w-[420px] md:max-w-[420px]'>
        <input
          className='form-input mb-4 w-[calc(100%-2.5rem)] border-none p-0 font-sans text-base outline-hidden focus:outline-hidden focus:ring-1 focus:ring-slate-600'
          type='text'
          name='title'
          placeholder={placeholder}
          value={title}
          onChange={onNameChange}
          min={1}
          max={50}
        />
        {titleErr && <StyledError>{titleErr}</StyledError>}
        <RecurrenceSettings className={'p-0'} rrule={rrule} onRruleUpdated={setRrule} />
        <ActionsContainer>
          {isMeetingSeriesActive && (
            <StopButton onClick={onStopRecurrence}>Stop Recurrence</StopButton>
          )}
          <UpdateButton onClick={onUpdateRecurrenceClicked} disabled={!canUpdate}>
            Update
          </UpdateButton>
        </ActionsContainer>
        {error && <div className='text-tomato-500'>{error.message}</div>}
      </DialogContent>
    </Dialog>
  )
}
