import React, {useMemo, useState} from 'react'
import graphql from 'babel-plugin-relay/macro'
import DialogContainer from '../../DialogContainer'
import {EndRecurringMeetingModal_meeting$key} from '~/__generated__/EndRecurringMeetingModal_meeting.graphql'
import {useFragment} from 'react-relay'
import clsx from 'clsx'
import EndTeamPromptMutation from '../../../mutations/EndTeamPromptMutation'
import useAtmosphere from '../../../hooks/useAtmosphere'
import useMutationProps from '../../../hooks/useMutationProps'
import useRouter from '../../../hooks/useRouter'
import UpdateRecurrenceSettingsMutation from '../../../mutations/UpdateRecurrenceSettingsMutation'
import {RRule} from 'rrule'
import {humanReadableCountdown} from '../../../utils/date/relativeDate'

interface Props {
  meetingRef: EndRecurringMeetingModal_meeting$key
  recurrenceRule?: string
  closeModal: () => void
}

const ACTION_BUTTON_CLASSES =
  'text-base font-medium cursor-pointer text-center rounded-full px-4 py-2'

export const EndRecurringMeetingModal = (props: Props) => {
  const {meetingRef, recurrenceRule, closeModal} = props
  const meeting = useFragment(
    graphql`
      fragment EndRecurringMeetingModal_meeting on NewMeeting {
        id
      }
    `,
    meetingRef
  )

  const {id: meetingId} = meeting
  const {onCompleted, onError} = useMutationProps()
  const {history} = useRouter()

  const atmosphere = useAtmosphere()

  const [isMeetingOnly, setIsMeetingOnly] = useState(true)

  const onConfirm = () => {
    if (!isMeetingOnly) {
      UpdateRecurrenceSettingsMutation(
        atmosphere,
        {meetingId: meetingId, recurrenceRule: null},
        {onError, onCompleted}
      )
    }

    EndTeamPromptMutation(atmosphere, {meetingId}, {onCompleted, onError, history})
  }

  const fromNow = useMemo(() => {
    if (!recurrenceRule) return null
    const now = new Date()
    const nextMeetingDate = RRule.fromString(recurrenceRule).after(now)
    if (!nextMeetingDate) return null

    return humanReadableCountdown(nextMeetingDate)
  }, [recurrenceRule])

  return (
    <DialogContainer className='p-4'>
      <div className='mb-4 text-xl font-semibold'>End Meeting</div>
      <label className='mb-2 flex items-center'>
        <input
          className='h-5 w-5'
          name='isMeetingOnly'
          type='radio'
          checked={isMeetingOnly}
          value={'true'}
          onChange={() => setIsMeetingOnly(true)}
        />
        <div className='ml-4'>
          End this meeting (will restart {fromNow ? `in ${fromNow}` : 'soon'})
        </div>
      </label>
      <label className='flex items-center'>
        <input
          className='h-5 w-5'
          name='isMeetingOnly'
          type='radio'
          checked={!isMeetingOnly}
          value={'false'}
          onChange={() => setIsMeetingOnly(false)}
        />
        <div className='ml-4'>End this meeting and don't restart</div>
      </label>
      <div className='mt-4 flex justify-end gap-2.5'>
        <button
          className={clsx(
            'border border-solid border-slate-400 bg-white text-slate-700 hover:bg-slate-100',
            ACTION_BUTTON_CLASSES
          )}
          onClick={closeModal}
        >
          Cancel
        </button>
        <button
          className={clsx('bg-sky-500 text-white hover:bg-sky-600', ACTION_BUTTON_CLASSES)}
          onClick={onConfirm}
        >
          Confirm
        </button>
      </div>
    </DialogContainer>
  )
}
