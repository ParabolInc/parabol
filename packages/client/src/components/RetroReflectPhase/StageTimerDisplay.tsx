import React from 'react'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import styled from '@emotion/styled'
import StageTimerDisplayGauge from './StageTimerDisplayGauge'
import {Breakpoint} from 'parabol-client/src/types/constEnums'
import PhaseCompleteTag from './PhaseCompleteTag'
import {StageTimerDisplay_meeting} from 'parabol-client/src/__generated__/StageTimerDisplay_meeting.graphql'

interface Props {
  meeting: StageTimerDisplay_meeting
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
  const {meeting} = props
  const {localPhase, localStage} = meeting
  const {localScheduledEndTime, isComplete} = localStage
  const {stages} = localPhase
  const isPhaseComplete = stages.every((stage) => stage.isComplete)
  return (
    <DisplayRow>
      {localScheduledEndTime && !isComplete ? (
        <StageTimerDisplayGauge endTime={localScheduledEndTime} />
      ) : null}
      <PhaseCompleteTag isComplete={isPhaseComplete} />
    </DisplayRow>
  )
}

graphql`
  fragment StageTimerDisplayStage on NewMeetingStage {
    isComplete
    scheduledEndTime @__clientField(handle: "localTime")
    timeRemaining
    localScheduledEndTime
  }
`
export default createFragmentContainer(StageTimerDisplay, {
  meeting: graphql`
    fragment StageTimerDisplay_meeting on NewMeeting {
      localPhase {
        stages {
          isComplete
        }
      }
      localStage {
        ...StageTimerDisplayStage @relay(mask: false)
      }
      phases {
        stages {
          ...StageTimerDisplayStage @relay(mask: false)
          isComplete
        }
      }
    }
  `
})
