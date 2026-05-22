import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import {type ChangeEvent, useState} from 'react'
import {useFragment} from 'react-relay'
import {RRule} from 'rrule'
import type {MeetingSeriesEditForm_series$key} from '../__generated__/MeetingSeriesEditForm_series.graphql'
import useAtmosphere from '../hooks/useAtmosphere'
import useForm from '../hooks/useForm'
import useModal from '../hooks/useModal'
import useMutationProps, {getOnCompletedError} from '../hooks/useMutationProps'
import UpdateMeetingSeriesMutation from '../mutations/UpdateMeetingSeriesMutation'
import {PALETTE} from '../styles/paletteV3'
import Legitity from '../validation/Legitity'
import {CancelSeriesConfirmationModal} from './CancelSeriesConfirmationModal'
import PlainButton from './PlainButton/PlainButton'
import {RecurrenceSettings} from './Recurrence/RecurrenceSettings'
import StyledError from './StyledError'

const TitleInput = styled('input')({
  width: '100%',
  border: 'none',
  borderBottom: `1px solid ${PALETTE.SLATE_300}`,
  padding: '8px 0',
  fontSize: 18,
  fontFamily: 'inherit',
  outline: 'none',
  '&:focus': {borderBottom: `2px solid ${PALETTE.SKY_500}`}
})

const ActionsContainer = styled('div')({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginTop: 24,
  paddingTop: 16,
  borderTop: `1px solid ${PALETTE.SLATE_200}`
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
  '&:hover': {backgroundColor: PALETTE.SKY_600},
  '&:disabled': {backgroundColor: PALETTE.SLATE_300, cursor: 'not-allowed'}
})

const CancelSeriesButton = styled(ActionButton)({
  color: PALETTE.TOMATO_500,
  border: `1px solid ${PALETTE.SLATE_300}`,
  '&:hover': {backgroundColor: PALETTE.SLATE_100}
})

const ErrorContainer = styled('div')({
  color: PALETTE.TOMATO_500,
  marginTop: 12
})

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

  const {togglePortal: toggleCancelModal, modalPortal: cancelModalPortal} = useModal({
    id: 'cancelSeriesConfirmationModal'
  })

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
      <TitleInput
        type='text'
        name='title'
        placeholder='Meeting title'
        value={title}
        onChange={onTitleChange}
        maxLength={50}
      />
      {titleErr && <StyledError>{titleErr}</StyledError>}
      <RecurrenceSettings rrule={rrule} onRruleUpdated={setRrule} />
      <ActionsContainer>
        {isActive ? (
          <CancelSeriesButton onClick={toggleCancelModal} disabled={submitting}>
            Cancel series
          </CancelSeriesButton>
        ) : (
          <span className='text-slate-500 text-sm'>Series cancelled</span>
        )}
        <UpdateButton onClick={onUpdate} disabled={!canUpdate}>
          Update
        </UpdateButton>
      </ActionsContainer>
      {error && <ErrorContainer>{error.message}</ErrorContainer>}
      {cancelModalPortal(
        <CancelSeriesConfirmationModal
          seriesTitle={meetingSeries.title}
          onConfirm={() => {
            toggleCancelModal()
            onCancelSeries()
          }}
          closeModal={toggleCancelModal}
        />
      )}
    </>
  )
}
