import React from 'react'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import {StageTimerDisplay_stage} from '../../__generated__/StageTimerDisplay_stage.graphql'
import styled from '@emotion/styled'
import StageTimerDisplayGauge from './StageTimerDisplayGauge'
import useBreakpoint from '../../hooks/useBreakpoint'
import {Breakpoint} from '../../types/constEnums'

interface Props {
  stage: StageTimerDisplay_stage
}

const DisplayRow = styled('div')<{isDesktop}>(({isDesktop}) => ({
  display: 'flex',
  justifyContent: 'center',
  // desktop: dont' want stuff to move when it turns on
  minHeight: isDesktop ? 36 : undefined
}))

const StageTimerDisplay = (props: Props) => {
  const {stage} = props
  const {localScheduledEndTime, isComplete} = stage
  const isDesktop = useBreakpoint(Breakpoint.SINGLE_REFLECTION_COLUMN)
  return (
    <DisplayRow isDesktop={isDesktop}>
      {localScheduledEndTime && !isComplete ? (
        <StageTimerDisplayGauge endTime={localScheduledEndTime} />
      ) : null}
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
