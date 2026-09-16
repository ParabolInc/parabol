import graphql from 'babel-plugin-relay/macro'
import {type ChangeEvent, useState} from 'react'
import {useFragment} from 'react-relay'
import {RRule} from 'rrule'
import type {MeetingSeriesEditForm_series$key} from '../__generated__/MeetingSeriesEditForm_series.graphql'
import useAtmosphere from '../hooks/useAtmosphere'
import useForm from '../hooks/useForm'
import useMutationProps, {getOnCompletedError} from '../hooks/useMutationProps'
import UpdateMeetingSeriesMutation from '../mutations/UpdateMeetingSeriesMutation'
import UpdateRecurrenceSettingsMutation from '../mutations/UpdateRecurrenceSettingsMutation'
import type {CompletedHandler} from '../types/relayMutations'
import {cn} from '../ui/cn'
import {useDialogState} from '../ui/Dialog/useDialogState'
import Legitity from '../validation/Legitity'
import {CancelSeriesConfirmationModal} from './CancelSeriesConfirmationModal'
import {RecurrenceSettings} from './Recurrence/RecurrenceSettings'

const validateTitle = (title: string) =>
  new Legitity(title).trim().min(2, "C'mon, you call that a title?")

interface Props {
  seriesRef: MeetingSeriesEditForm_series$key | null | undefined
  // set when editing from inside a live meeting, which may have no series yet or a cancelled one
  meetingId?: string
  defaultTitle?: string
  onClose: () => void
  onCancelled?: () => void
}

export const MeetingSeriesEditForm = (props: Props) => {
  const {seriesRef, meetingId, defaultTitle, onClose, onCancelled} = props
  const meetingSeries = useFragment(
    graphql`
      fragment MeetingSeriesEditForm_series on MeetingSeries {
        id
        title
        recurrenceRule
        cancelledAt
      }
    `,
    seriesRef
  )

  const atmosphere = useAtmosphere()
  const isActive = !!meetingSeries && !meetingSeries.cancelledAt
  // a cancelled series keeps its stale rule, so pick a fresh one when reviving it
  const initialRrule =
    isActive && meetingSeries.recurrenceRule ? RRule.fromString(meetingSeries.recurrenceRule) : null
  const [rrule, setRrule] = useState<RRule | null>(initialRrule)
  const {submitting, onError, onCompleted, submitMutation, error} = useMutationProps()
  const {fields, onChange} = useForm({
    title: {getDefault: () => meetingSeries?.title || defaultTitle || ''}
  })

  const cancelDialog = useDialogState()

  const onTitleChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (fields.title.error) fields.title.setError('')
    onChange(event)
  }

  // inside a live meeting the mutation is keyed by the meeting, so it can start a series that doesn't exist yet
  const commitRecurrence = (
    variables: {name?: string; rrule: string | null | undefined},
    handler: CompletedHandler
  ) => {
    submitMutation()
    if (meetingId) {
      UpdateRecurrenceSettingsMutation(
        atmosphere,
        {meetingId, ...variables},
        {onError, onCompleted: handler}
      )
      return
    }
    if (!meetingSeries) return
    UpdateMeetingSeriesMutation(
      atmosphere,
      {meetingSeriesId: meetingSeries.id, ...variables},
      {onError, onCompleted: handler}
    )
  }

  const onSuccess =
    (key: string, message: string, afterSuccess?: () => void): CompletedHandler =>
    (res, errors) => {
      onCompleted(res, errors)
      if (getOnCompletedError(res, errors)) return
      atmosphere.eventEmitter.emit('addSnackbar', {
        key,
        message,
        autoDismiss: 8,
        showDismissButton: true
      })
      afterSuccess?.()
      onClose()
    }

  const onUpdate = () => {
    if (submitting) return
    const title = fields.title.value
    const titleRes = validateTitle(title)
    if (titleRes.error) {
      fields.title.setError(titleRes.error)
      return
    }
    commitRecurrence(
      {name: title, rrule: rrule?.toString()},
      onSuccess('meetingSeriesUpdated', isActive ? '🎉 Series updated.' : '🎉 Recurrence started.')
    )
  }

  const onCancelSeries = () => {
    if (submitting) return
    commitRecurrence(
      {rrule: null},
      onSuccess('meetingSeriesCancelled', 'Recurrence cancelled.', onCancelled)
    )
  }

  const title = fields.title.value
  const titleErr = fields.title.error
  const titleChanged = title !== (meetingSeries?.title ?? '')
  const rruleChanged = rrule?.toString() !== initialRrule?.toString()
  // without a live meeting there is nothing to hang a brand new series on
  const hasChanges = isActive ? titleChanged || rruleChanged : !!meetingId
  const canUpdate = !!rrule && hasChanges && !submitting

  return (
    <>
      <input
        className='w-full border-0 border-hairline border-b border-solid py-2 text-lg outline-hidden focus:border-accent focus:border-b-2'
        type='text'
        name='title'
        placeholder='Meeting title'
        value={title}
        onChange={onTitleChange}
        maxLength={50}
      />
      {titleErr && <div className='mt-1 text-fg-error text-sm'>{titleErr}</div>}
      <RecurrenceSettings rrule={rrule} onRruleUpdated={setRrule} />
      <div
        className={cn(
          'mt-6 flex items-center border-hairline border-t pt-4',
          isActive ? 'justify-between' : 'justify-end'
        )}
      >
        {isActive && (
          <button
            className='h-9 cursor-pointer rounded-md border border-hairline border-solid bg-transparent px-4 text-center text-tomato-500 hover:bg-surface-hover disabled:cursor-not-allowed'
            onClick={cancelDialog.open}
            disabled={submitting}
          >
            Cancel series
          </button>
        )}
        <button
          className='h-9 cursor-pointer rounded-md bg-sky-500 px-4 text-center text-white hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-50'
          onClick={onUpdate}
          disabled={!canUpdate}
        >
          {isActive ? 'Update' : 'Start recurrence'}
        </button>
      </div>
      {error && <div className='mt-3 text-fg-error'>{error.message}</div>}
      <CancelSeriesConfirmationModal
        isOpen={cancelDialog.isOpen}
        onClose={cancelDialog.close}
        seriesTitle={meetingSeries?.title ?? title}
        onConfirm={() => {
          cancelDialog.close()
          onCancelSeries()
        }}
      />
    </>
  )
}
