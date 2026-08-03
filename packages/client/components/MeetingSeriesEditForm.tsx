import graphql from 'babel-plugin-relay/macro'
import {type ChangeEvent, useState} from 'react'
import {useFragment} from 'react-relay'
import {RRule} from 'rrule'
import type {MeetingSeriesEditForm_series$key} from '../__generated__/MeetingSeriesEditForm_series.graphql'
import useAtmosphere from '../hooks/useAtmosphere'
import useForm from '../hooks/useForm'
import useMutationProps, {getOnCompletedError} from '../hooks/useMutationProps'
import UpdateMeetingSeriesMutation from '../mutations/UpdateMeetingSeriesMutation'
import {useDialogState} from '../ui/Dialog/useDialogState'
import Legitity from '../validation/Legitity'
import {CancelSeriesConfirmationModal} from './CancelSeriesConfirmationModal'
import {RecurrenceSettings} from './Recurrence/RecurrenceSettings'

const validateTitle = (title: string) =>
  new Legitity(title).trim().min(2, "C'mon, you call that a title?")

interface Props {
  seriesRef: MeetingSeriesEditForm_series$key
  onClose: () => void
  onCancelled?: () => void
}

export const MeetingSeriesEditForm = (props: Props) => {
  const {seriesRef, onClose, onCancelled} = props
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
  const initialRrule = meetingSeries.recurrenceRule
    ? RRule.fromString(meetingSeries.recurrenceRule)
    : null
  const [rrule, setRrule] = useState<RRule | null>(initialRrule)
  const {submitting, onError, onCompleted, submitMutation, error} = useMutationProps()
  const {fields, onChange} = useForm({
    title: {getDefault: () => meetingSeries.title || ''}
  })

  const cancelDialog = useDialogState()

  const onTitleChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (fields.title.error) fields.title.setError('')
    onChange(event)
  }

  const onUpdate = () => {
    if (submitting) return
    const title = fields.title.value
    const titleRes = validateTitle(title)
    if (titleRes.error) {
      fields.title.setError(titleRes.error)
      return
    }
    submitMutation()
    UpdateMeetingSeriesMutation(
      atmosphere,
      {meetingSeriesId: meetingSeries.id, name: title, rrule: rrule?.toString()},
      {
        onError,
        onCompleted: (res, errors) => {
          onCompleted(res, errors)
          if (getOnCompletedError(res, errors)) return
          atmosphere.eventEmitter.emit('addSnackbar', {
            key: 'meetingSeriesUpdated',
            message: '🎉 Series updated.',
            autoDismiss: 8,
            showDismissButton: true
          })
          onClose()
        }
      }
    )
  }

  const onCancelSeries = () => {
    if (submitting) return
    submitMutation()
    UpdateMeetingSeriesMutation(
      atmosphere,
      {meetingSeriesId: meetingSeries.id, rrule: null},
      {
        onError,
        onCompleted: (res, errors) => {
          onCompleted(res, errors)
          if (getOnCompletedError(res, errors)) return
          atmosphere.eventEmitter.emit('addSnackbar', {
            key: 'meetingSeriesCancelled',
            message: 'Recurrence cancelled.',
            autoDismiss: 8,
            showDismissButton: true
          })
          onCancelled?.()
          onClose()
        }
      }
    )
  }

  const title = fields.title.value
  const titleErr = fields.title.error
  const isActive = !meetingSeries.cancelledAt
  const titleChanged = title !== meetingSeries.title
  const rruleChanged = rrule?.toString() !== initialRrule?.toString()
  const canUpdate = isActive && !!rrule && (titleChanged || rruleChanged) && !submitting

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
      <div className='mt-6 flex items-center justify-between border-hairline border-t pt-4'>
        {isActive ? (
          <button
            className='h-9 cursor-pointer rounded-md border border-hairline border-solid bg-transparent px-4 text-center text-tomato-500 hover:bg-surface-hover disabled:cursor-not-allowed'
            onClick={cancelDialog.open}
            disabled={submitting}
          >
            Cancel series
          </button>
        ) : (
          <span className='text-fg-muted text-sm'>Series cancelled</span>
        )}
        <button
          className='h-9 cursor-pointer rounded-md bg-sky-500 px-4 text-center text-white hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-50'
          onClick={onUpdate}
          disabled={!canUpdate}
        >
          Update
        </button>
      </div>
      {error && <div className='mt-3 text-fg-error'>{error.message}</div>}
      <CancelSeriesConfirmationModal
        isOpen={cancelDialog.isOpen}
        onClose={cancelDialog.close}
        seriesTitle={meetingSeries.title}
        onConfirm={() => {
          cancelDialog.close()
          onCancelSeries()
        }}
      />
    </>
  )
}
