import React from 'react'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import {StageTimerDisplay_stage} from '../../__generated__/StageTimerDisplay_stage.graphql'
import styled from '@emotion/styled'
import StageTimerDisplayGauge from './StageTimerDisplayGauge'
import {Breakpoint} from 'types/constEnums'
import StageCompleteTag from './StageCompleteTag'

interface Props {
  stage: StageTimerDisplay_stage
}

const DisplayRow = styled('div')({
  display: 'flex',
  justifyContent: 'center',
  [`@media screen and (min-height: 800px) and (min-width: ${Breakpoint.SINGLE_REFLECTION_COLUMN}px)`]: {
    // for larger viewports: dont' want stuff to move when it turns on
    // adding a min-height, we lose too much vertical real estate when the timer is not used
    // todo: float over top bar when there’s room @ laptop+ breakpoint
    minHeight: 44
  }
})

const StageTimerDisplay = (props: Props) => {
  const {stage} = props
  const {localScheduledEndTime, isComplete} = stage
  return (
    <DisplayRow>
      {localScheduledEndTime && !isComplete ? (
        <StageTimerDisplayGauge endTime={localScheduledEndTime} />
      ) : null}
      <StageCompleteTag isComplete={isComplete} />
    </DisplayRow>
  )
}

export default createFragmentContainer(StageTimerDisplay, {
  stage: graphql`
    fragment StageTimerDisplay_stage on NewMeetingStage {
      isComplete
      scheduledEndTime @__clientField(handle: "localTime")
      timeRemaining
      localScheduledEndTime
    }
  `
})
