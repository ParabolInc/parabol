import React, {useEffect, useState} from 'react'
import {createFragmentContainer, graphql} from 'react-relay'
import {StageTimerDisplay_stage} from '__generated__/StageTimerDisplay_stage.graphql'
import styled from 'react-emotion'
import {countdown} from 'universal/utils/relativeDate'
import {PALETTE} from 'universal/styles/paletteV2'
import useRefreshInterval from 'universal/hooks/useRefreshInterval'

interface Props {
  stage: StageTimerDisplay_stage
}

const DisplayRow = styled('div')({
  display: 'flex',
  justifyContent: 'center'
})

const Gauge = styled('div')({
  color: '#fff',
  background: PALETTE.BACKGROUND.GREEN,
  minWidth: 112,
  padding: 8,
  textAlign: 'center'
})

const StageTimerDisplay = (props: Props) => {
  const {stage} = props
  const {timeRemaining} = stage
  const scheduledEndTime = stage.scheduledEndTime as string | null
  useRefreshInterval(1000)
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

  if (!endTime) return null
  const fromNow = countdown(endTime) || 'Time’s Up!'
  return (
    <DisplayRow>
      <Gauge>{fromNow}</Gauge>
    </DisplayRow>
  )
}

export default createFragmentContainer(
  StageTimerDisplay,
  graphql`
    fragment StageTimerDisplay_stage on NewMeetingStage {
      scheduledEndTime
      timeRemaining
    }
  `
)
