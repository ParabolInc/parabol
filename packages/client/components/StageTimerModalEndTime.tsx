import graphql from 'babel-plugin-relay/macro'
import ms from 'ms'
import {useState} from 'react'
import {useFragment} from 'react-relay'
import type {StageTimerModalEndTime_stage$key} from '../__generated__/StageTimerModalEndTime_stage.graphql'
import type {StageTimerModalEndTime_teamMember$key} from '../__generated__/StageTimerModalEndTime_teamMember.graphql'
import useAtmosphere from '../hooks/useAtmosphere'
import useMutationProps from '../hooks/useMutationProps'
import NotificationErrorMessage from '../modules/notifications/components/NotificationErrorMessage'
import SetStageTimerMutation from '../mutations/SetStageTimerMutation'
import {MeetingLabels} from '../types/constEnums'
import roundDateToNearestHalfHour from '../utils/roundDateToNearestHalfHour'
import SecondaryButton from './SecondaryButton'
import StageTimerModalEndTimeDate from './StageTimerModalEndTimeDate'
import StageTimerModalEndTimeHour from './StageTimerModalEndTimeHour'
import StageTimerModalEndTimeSlackToggle from './StageTimerModalEndTimeSlackToggle'

interface Props {
  closePortal: () => void
  teamMember: StageTimerModalEndTime_teamMember$key
  meetingId: string
  stage: StageTimerModalEndTime_stage$key
}

const DEFAULT_DURATION = ms('1d')
const TOMORROW = roundDateToNearestHalfHour(new Date(Date.now() + DEFAULT_DURATION))

const StageTimerModalEndTime = (props: Props) => {
  const {closePortal, teamMember: teamMemberRef, meetingId, stage: stageRef} = props
  const teamMember = useFragment(
    graphql`
      fragment StageTimerModalEndTime_teamMember on TeamMember {
        ...StageTimerModalEndTimeSlackToggle_teamMember
      }
    `,
    teamMemberRef
  )
  const stage = useFragment(
    graphql`
      fragment StageTimerModalEndTime_stage on NewMeetingStage {
        suggestedEndTime
        scheduledEndTime
      }
    `,
    stageRef
  )
  const scheduledEndTime = stage.scheduledEndTime as string | null
  const suggestedEndTime = stage.suggestedEndTime as string | null
  const [endTime, setEndTime] = useState(new Date(scheduledEndTime || suggestedEndTime || TOMORROW))

  const atmosphere = useAtmosphere()

  const {submitting, onError, onCompleted, submitMutation, error} = useMutationProps()

  const startTimer = () => {
    if (submitting || endTime.getTime() === new Date(scheduledEndTime || 0).getTime()) return
    if (endTime.getTime() <= Date.now()) {
      onError(new Error('Time must be in the future'))
      return
    }
    submitMutation()
    SetStageTimerMutation(
      atmosphere,
      {meetingId, scheduledEndTime: endTime},
      {onError, onCompleted}
    )
    closePortal()
  }

  return (
    <div className='flex flex-col items-center px-4 pt-4 pb-2'>
      <div className='flex w-full select-none items-center'>
        <StageTimerModalEndTimeDate endTime={endTime} setEndTime={setEndTime} />
      </div>
      <div className='flex w-full select-none items-center'>
        <StageTimerModalEndTimeHour endTime={endTime} setEndTime={setEndTime} />
      </div>
      <div className='flex w-full select-none items-center'>
        <StageTimerModalEndTimeSlackToggle teamMember={teamMember} />
      </div>
      <NotificationErrorMessage className='-mb-2' error={error} />
      <SecondaryButton className='mt-2 min-w-[192px]' onClick={startTimer}>
        {scheduledEndTime ? 'Update ' : 'Start '}
        {MeetingLabels.TIME_LIMIT}
      </SecondaryButton>
    </div>
  )
}

export default StageTimerModalEndTime
