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
import type {
  CompletedHandler,
  NavigateMaybeLocalHandler,
  StandardMutation
} from '../../types/relayMutations'
import {cn} from '../../ui/cn'
import {Dialog} from '../../ui/Dialog/Dialog'
import {DialogContent} from '../../ui/Dialog/DialogContent'
import {humanReadableCountdown} from '../../utils/date/relativeDate'

export const EndMeetingMutationLookup = {
  teamPrompt: EndTeamPromptMutation,
  action: EndCheckInMutation,
  retrospective: EndRetrospectiveMutation,
  poker: EndSprintPokerMutation
} satisfies Record<MeetingTypeEnum, StandardMutation<any, NavigateMaybeLocalHandler>>

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
  nextMeetingDate?: string | null
  closeModal: () => void
}

const ACTION_BUTTON_CLASSES =
  'font-sans text-base font-medium cursor-pointer text-center rounded-full px-4 py-2'

export const EndRecurringMeetingModal = (props: Props) => {
  const {isOpen, meetingRef, nextMeetingDate, closeModal} = props

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

  const {onCompleted, onError} = useMutationProps()
  const navigate = useNavigate()
  const atmosphere = useAtmosphere()
  const [isMeetingOnly, setIsMeetingOnly] = useState(true)

  const handleCompleted: CompletedHandler = () => {
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
        <div className='mb-4 font-semibold text-xl'>End Meeting</div>
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
        <div className='flex justify-end gap-2.5'>
          <button
            className={cn(
              'border border-hairline-strong border-solid bg-surface-card text-fg-primary hover:bg-surface-hover',
              ACTION_BUTTON_CLASSES
            )}
            onClick={closeModal}
          >
            Cancel
          </button>
          <button
            className={cn('bg-sky-500 text-white hover:bg-sky-600', ACTION_BUTTON_CLASSES)}
            onClick={onConfirm}
          >
            Confirm
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
