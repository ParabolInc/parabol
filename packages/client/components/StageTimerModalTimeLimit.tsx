import graphql from 'babel-plugin-relay/macro'
import ms from 'ms'
import {useState} from 'react'
import {useFragment} from 'react-relay'
import {Timer} from '~/ui/icons'
import type {StageTimerModalTimeLimit_stage$key} from '../__generated__/StageTimerModalTimeLimit_stage.graphql'
import useAtmosphere from '../hooks/useAtmosphere'
import useMutationProps from '../hooks/useMutationProps'
import SetStageTimerMutation from '../mutations/SetStageTimerMutation'
import {MeetingLabels} from '../types/constEnums'
import {Button} from '../ui/Button/Button'
import {Select} from '../ui/Select/Select'
import {SelectContent} from '../ui/Select/SelectContent'
import {SelectItem} from '../ui/Select/SelectItem'
import {SelectTrigger} from '../ui/Select/SelectTrigger'
import {SelectValue} from '../ui/Select/SelectValue'
import plural from '../utils/plural'
import StyledError from './StyledError'

interface Props {
  closePortal: () => void
  defaultTimeLimit: number
  meetingId: string
  stage: StageTimerModalTimeLimit_stage$key
}

const minuteOptions = [...Array(10).keys()].map((n) => n + 1)

const StageTimerModalTimeLimit = (props: Props) => {
  const {closePortal, defaultTimeLimit, meetingId, stage: stageRef} = props
  const stage = useFragment(
    graphql`
      fragment StageTimerModalTimeLimit_stage on NewMeetingStage {
        suggestedTimeLimit
        scheduledEndTime
        localScheduledEndTime
      }
    `,
    stageRef
  )
  const {suggestedTimeLimit, scheduledEndTime, localScheduledEndTime} = stage
  const initialTimeLimit =
    scheduledEndTime || !suggestedTimeLimit
      ? defaultTimeLimit
      : Math.min(10, Math.max(1, Math.round(suggestedTimeLimit / ms('1m'))))
  // scheduledEndTime means we're editing an existing timer
  const atmosphere = useAtmosphere()
  const [minuteTimeLimit, setMinuteTimeLimit] = useState(initialTimeLimit)
  const {submitting, onError, onCompleted, submitMutation, error} = useMutationProps()
  const startTimer = () => {
    if (submitting) return
    const endTime = localScheduledEndTime ?? scheduledEndTime
    const spareTime = endTime ? Math.max(0, new Date(endTime).getTime() - Date.now()) : 0
    const timeRemaining = minuteTimeLimit * ms('1m') + spareTime
    submitMutation()
    SetStageTimerMutation(
      atmosphere,
      {
        meetingId,
        timeRemaining,
        scheduledEndTime: new Date(Date.now() + timeRemaining)
      },
      {onError, onCompleted}
    )
    closePortal()
  }

  return (
    <div className='flex flex-col items-center px-4 pt-4 pb-2'>
      <div className='flex w-full items-center'>
        <Timer className='text-fg-secondary' />
        <Select
          value={String(minuteTimeLimit)}
          onValueChange={(value) => setMinuteTimeLimit(Number(value))}
        >
          <SelectTrigger className='ml-2 h-9 rounded-sm'>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {minuteOptions.map((n) => (
              <SelectItem key={n} value={String(n)} checkClassName='text-accent-active'>
                {`${n} ${plural(n, 'minute')}`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Button variant='outline' size='sm' className='mt-2 min-w-[192px]' onClick={startTimer}>
        {scheduledEndTime ? 'Add Time' : `Start ${MeetingLabels.TIMER}`}
      </Button>
      {error && <StyledError>{error.message}</StyledError>}
    </div>
  )
}

export default StageTimerModalTimeLimit
