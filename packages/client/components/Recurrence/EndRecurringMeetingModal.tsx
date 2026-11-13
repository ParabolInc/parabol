import graphql from 'babel-plugin-relay/macro'
import {useMemo, useState} from 'react'
import {useFragment} from 'react-relay'
import {useNavigate} from 'react-router'
import type {EndRecurringMeetingModal_meeting$key} from '../../__generated__/EndRecurringMeetingModal_meeting.graphql'
import type {MeetingTypeEnum} from '../../__generated__/MeetingSelectorQuery.graphql'
import useAtmosphere from '../../hooks/useAtmosphere'
import useMutationProps from '../../hooks/useMutationProps'
import EndCheckInMutation from '../../mutations/EndCheckInMutation'
import EndRetrospectiveMutation from '../../mutations/EndRetrospectiveMutation'
import EndSprintPokerMutation from '../../mutations/EndSprintPokerMutation'
import EndTeamPromptMutation from '../../mutations/EndTeamPromptMutation'
import UpdateRecurrenceSettingsMutation from '../../mutations/UpdateRecurrenceSettingsMutation'
import useEndTeamHealthMutation from '../../mutations/useEndTeamHealthMutation'
import type {
  CompletedHandler,
  NavigateMaybeLocalHandler,
  StandardMutation
} from '../../types/relayMutations'
import {Button} from '../../ui/Button/Button'
import {Dialog} from '../../ui/Dialog/Dialog'
import {DialogActions} from '../../ui/Dialog/DialogActions'
import {DialogContent} from '../../ui/Dialog/DialogContent'
import {DialogTitle} from '../../ui/Dialog/DialogTitle'
import {humanReadableCountdown} from '../../utils/date/relativeDate'
import getMutationError from '../../utils/relay/getMutationError'

export const EndMeetingMutationLookup = {
  teamPrompt: EndTeamPromptMutation,
  action: EndCheckInMutation,
  retrospective: EndRetrospectiveMutation,
  poker: EndSprintPokerMutation,
  // team health uses the useEndTeamHealthMutation hook, handled separately in onConfirm
  teamHealth: null
} satisfies Record<MeetingTypeEnum, StandardMutation<any, NavigateMaybeLocalHandler> | null>

interface RadioToggleProps {
  checked: boolean
  value: boolean
  setChecked: (isChecked: boolean) => void
  label: string
}

const RadioToggle = (props: RadioToggleProps) => {
  const {checked, value, setChecked, label} = props
  return (
    <label className='flex items-center'>
      <input
        className='h-5 w-5'
        name='isMeetingOnly'
        type='radio'
        checked={checked}
        value={`${value}`}
        onChange={() => setChecked(value)}
      />
      <div className='ml-4'>{label}</div>
    </label>
  )
}

interface Props {
  isOpen: boolean
  meetingRef: EndRecurringMeetingModal_meeting$key
  hasSeries: boolean
  nextMeetingDate?: string | null
  hasUnsharedDraft?: boolean
  closeModal: () => void
}

export const EndRecurringMeetingModal = (props: Props) => {
  const {
    isOpen,
    meetingRef,
    hasSeries,
    nextMeetingDate,
    hasUnsharedDraft = false,
    closeModal
  } = props

  const meeting = useFragment(
    graphql`
      fragment EndRecurringMeetingModal_meeting on NewMeeting {
        id
        meetingType
      }
    `,
    meetingRef
  )
  const {meetingType, id: meetingId} = meeting

  const {onCompleted, onError, submitMutation, submitting} = useMutationProps()
  const navigate = useNavigate()
  const atmosphere = useAtmosphere()
  const [endTeamHealth] = useEndTeamHealthMutation()
  const [isMeetingOnly, setIsMeetingOnly] = useState(true)

  const handleCompleted: CompletedHandler = (res, errors) => {
    if (getMutationError(res, errors)) {
      onCompleted(res, errors)
      return
    }
    if (!isMeetingOnly) {
      UpdateRecurrenceSettingsMutation(
        atmosphere,
        {meetingId, name: null, rrule: null},
        {onError, onCompleted}
      )
    } else {
      onCompleted()
    }
    closeModal()
  }

  const onConfirm = () => {
    if (submitting) return
    submitMutation()
    if (meetingType === 'teamHealth') {
      endTeamHealth({variables: {meetingId}, onCompleted: handleCompleted, onError})
      return
    }
    EndMeetingMutationLookup[meetingType]?.(
      atmosphere,
      {meetingId},
      {onCompleted: handleCompleted, onError, navigate}
    )
  }

  const fromNow = useMemo(() => {
    if (!nextMeetingDate) return null
    return humanReadableCountdown(new Date(nextMeetingDate))
  }, [nextMeetingDate])

  return (
    <Dialog isOpen={isOpen} onClose={closeModal}>
      <DialogContent>
        <DialogTitle className='mb-4'>{hasSeries ? 'End Meeting' : 'End this meeting'}</DialogTitle>
        {hasSeries && (
          <div className='mb-4 flex flex-col gap-2'>
            <RadioToggle
              checked={isMeetingOnly}
              value={true}
              setChecked={setIsMeetingOnly}
              label={`End this meeting (will restart ${fromNow ? `in ${fromNow}` : 'soon'})`}
            />
            <RadioToggle
              checked={!isMeetingOnly}
              value={false}
              setChecked={setIsMeetingOnly}
              label={"End this meeting and don't restart"}
            />
          </div>
        )}
        {hasUnsharedDraft && (
          <p className='mb-4 text-fg-primary text-sm'>
            You have an unshared draft. Drafts are not included in the summary.
          </p>
        )}
        <DialogActions>
          <Button variant='outline' size='md' onClick={closeModal}>
            Cancel
          </Button>
          <Button variant='primary' size='md' onClick={onConfirm} disabled={submitting}>
            Confirm
          </Button>
        </DialogActions>
      </DialogContent>
    </Dialog>
  )
}
