import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import {TimerOff} from '~/ui/icons'
import type {StageTimerModalEditTimeLimit_stage$key} from '../__generated__/StageTimerModalEditTimeLimit_stage.graphql'
import useAtmosphere from '../hooks/useAtmosphere'
import useMutationProps from '../hooks/useMutationProps'
import SetStageTimerMutation from '../mutations/SetStageTimerMutation'
import {MeetingLabels} from '../types/constEnums'
import MenuItemHR from './MenuItemHR'
import PlainButton from './PlainButton/PlainButton'
import StageTimerModalTimeLimit from './StageTimerModalTimeLimit'

interface Props {
  meetingId: string
  stage: StageTimerModalEditTimeLimit_stage$key
  closePortal: () => void
}

const StageTimerModalEditTimeLimit = (props: Props) => {
  const {meetingId, closePortal, stage: stageRef} = props
  const stage = useFragment(
    graphql`
      fragment StageTimerModalEditTimeLimit_stage on NewMeetingStage {
        ...StageTimerModalTimeLimit_stage
      }
    `,
    stageRef
  )
  const atmosphere = useAtmosphere()
  const {submitMutation, onCompleted, onError, submitting} = useMutationProps()
  const endTimer = () => {
    if (submitting) return
    submitMutation()
    SetStageTimerMutation(atmosphere, {meetingId, scheduledEndTime: null}, {onError, onCompleted})
    closePortal()
  }
  return (
    <div className='flex flex-col items-center'>
      <PlainButton className='flex w-full items-center px-4 py-2' onClick={endTimer}>
        <TimerOff className='text-fg-secondary' />
        <div className='pl-4 text-[14px] leading-none'>End {MeetingLabels.TIMER}</div>
      </PlainButton>
      <MenuItemHR className='-mb-2 w-full' />
      <StageTimerModalTimeLimit
        closePortal={closePortal}
        stage={stage}
        meetingId={meetingId}
        defaultTimeLimit={1}
      />
    </div>
  )
}

export default StageTimerModalEditTimeLimit
