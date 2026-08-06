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
import type {CompletedHandler} from '../../types/relayMutations'
import {cn} from '../../ui/cn'
import {Dialog} from '../../ui/Dialog/Dialog'
import {DialogContent} from '../../ui/Dialog/DialogContent'
import Legitity from '../../validation/Legitity'
import PlainButton from '../PlainButton/PlainButton'
import StyledError from '../StyledError'
import {RecurrenceSettings} from './RecurrenceSettings'

const actionButtonClassName = 'h-9 rounded-[32px] px-4 text-center'

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
        <div className='flex justify-end pt-4'>
          {isMeetingSeriesActive && (
            <PlainButton
              className={cn(
                actionButtonClassName,
                'mr-4 border border-hairline-field text-accent hover:bg-surface-hover focus:outline-1 focus:outline-hairline focus:outline-offset-1 active:outline-1 active:outline-hairline active:outline-offset-1'
              )}
              onClick={onStopRecurrence}
            >
              Stop Recurrence
            </PlainButton>
          )}
          <PlainButton
            className={cn(
              actionButtonClassName,
              'bg-sky-500 text-white hover:bg-sky-600 focus:outline-1 focus:outline-sky-600 focus:outline-offset-1 active:outline-1 active:outline-sky-600 active:outline-offset-1'
            )}
            onClick={onUpdateRecurrenceClicked}
            disabled={!canUpdate}
          >
            Update
          </PlainButton>
        </div>
        {error && <div className='text-fg-error'>{error.message}</div>}
      </DialogContent>
    </Dialog>
  )
}
