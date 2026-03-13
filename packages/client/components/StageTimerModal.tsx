import {Event as EventIcon, Timer as TimerIcon} from '@mui/icons-material'
import graphql from 'babel-plugin-relay/macro'
import {useState} from 'react'
import {useFragment} from 'react-relay'
import type {StageTimerModal_facilitator$key} from '../__generated__/StageTimerModal_facilitator.graphql'
import type {StageTimerModal_stage$key} from '../__generated__/StageTimerModal_stage.graphql'
import type {MenuProps} from '../hooks/useMenu'
import StageTimerModalEditTimeEnd from './StageTimerModalEditTimeEnd'
import StageTimerModalEditTimeLimit from './StageTimerModalEditTimeLimit'
import StageTimerModalEndTime from './StageTimerModalEndTime'
import StageTimerModalTimeLimit from './StageTimerModalTimeLimit'
import SwipeablePanel from './SwipeablePanel'
import Tab from './Tab/Tab'
import Tabs from './Tabs/Tabs'

const WIDTH = 224

interface Props {
  defaultTimeLimit: number
  defaultToAsync: boolean
  meetingId: string
  stage: StageTimerModal_stage$key
  menuProps: MenuProps
  facilitator: StageTimerModal_facilitator$key
}

const StageTimerModal = (props: Props) => {
  const {
    defaultTimeLimit,
    defaultToAsync,
    meetingId,
    menuProps,
    stage: stageRef,
    facilitator: facilitatorRef
  } = props
  const facilitator = useFragment(
    graphql`
      fragment StageTimerModal_facilitator on TeamMember {
        ...StageTimerModalEndTime_facilitator
        ...StageTimerModalEditTimeEnd_facilitator
      }
    `,
    facilitatorRef
  )
  const stage = useFragment(
    graphql`
      fragment StageTimerModal_stage on NewMeetingStage {
        ...StageTimerModalTimeLimit_stage
        ...StageTimerModalEditTimeLimit_stage
        ...StageTimerModalEndTime_stage
        ...StageTimerModalEditTimeEnd_stage
        isAsync
        suggestedTimeLimit
      }
    `,
    stageRef
  )
  const {isAsync} = stage
  const [activeIdx, setActiveIdx] = useState(defaultToAsync ? 1 : 0)
  const {closePortal} = menuProps
  if (isAsync === false) {
    return (
      <StageTimerModalEditTimeLimit meetingId={meetingId} closePortal={closePortal} stage={stage} />
    )
  } else if (isAsync) {
    return (
      <StageTimerModalEditTimeEnd
        meetingId={meetingId}
        closePortal={closePortal}
        stage={stage}
        facilitator={facilitator}
      />
    )
  }
  return (
    <div className='flex flex-col items-center overflow-hidden' style={{width: WIDTH}}>
      <Tabs activeIdx={activeIdx} className='shadow-[inset_0_-1px_0_theme(colors.slate.300)]'>
        <Tab
          className='w-[112px] justify-center pt-1 pb-2'
          label={<TimerIcon />}
          onClick={() => setActiveIdx(0)}
        />
        <Tab
          className='w-[112px] justify-center pt-1 pb-2'
          label={<EventIcon />}
          onClick={() => setActiveIdx(1)}
        />
      </Tabs>
      <SwipeablePanel index={activeIdx} onChangeIndex={(idx) => setActiveIdx(idx)} animateHeight>
        <div className='flex flex-col items-center'>
          <StageTimerModalTimeLimit
            defaultTimeLimit={defaultTimeLimit}
            meetingId={meetingId}
            closePortal={closePortal}
            stage={stage}
          />
        </div>
        <div className='flex flex-col items-center'>
          <StageTimerModalEndTime
            facilitator={facilitator}
            meetingId={meetingId}
            closePortal={closePortal}
            stage={stage}
          />
        </div>
      </SwipeablePanel>
    </div>
  )
}

export default StageTimerModal
