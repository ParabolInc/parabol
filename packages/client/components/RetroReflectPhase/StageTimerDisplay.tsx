import React, {useEffect, useState} from 'react'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import {StageTimerDisplay_stage} from '../../__generated__/StageTimerDisplay_stage.graphql'
import styled from '@emotion/styled'
import StageTimerDisplayGauge from './StageTimerDisplayGauge'

interface Props {
  stage: StageTimerDisplay_stage
}

const DisplayRow = styled('div')({
  display: 'flex',
  justifyContent: 'center',
  // dont' want stuff to move when it turns on
  minHeight: 32
})

const StageTimerDisplay = (props: Props) => {
  const {stage} = props
  const {isComplete, timeRemaining} = stage
  const scheduledEndTime = stage.scheduledEndTime as string | null
  const [endTime, setEndTime] = useState<string | null>(scheduledEndTime)
  useEffect(() => {
    let reconciledEndTime = scheduledEndTime
    if (timeRemaining && scheduledEndTime) {
      const actualTimeRemaining = new Date(scheduledEndTime).getTime() - Date.now()
      const badClientClock = Math.abs(timeRemaining - actualTimeRemaining) > 2000
      if (badClientClock) {
        reconciledEndTime = new Date(Date.now() + timeRemaining - 300).toJSON()
      }
    }
    setEndTime(reconciledEndTime)
  }, [scheduledEndTime, timeRemaining])
  return (
    <DisplayRow>
      {endTime && !isComplete ? <StageTimerDisplayGauge endTime={endTime} /> : null}
    </DisplayRow>
  )
}

export default createFragmentContainer(StageTimerDisplay, {
  stage: graphql`
    fragment StageTimerDisplay_stage on NewMeetingStage {
      isComplete
      scheduledEndTime
      timeRemaining
    }
  `
})
