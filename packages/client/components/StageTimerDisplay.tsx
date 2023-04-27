import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
import PhaseCompleteTag from '~/components/Tag/PhaseCompleteTag'
import UndoableGroupPhaseControl from '~/components/UndoableGroupPhaseControl'
import useAtmosphere from '~/hooks/useAtmosphere'
import {Breakpoint} from '~/types/constEnums'
import isDemoRoute from '~/utils/isDemoRoute'
import {StageTimerDisplay_meeting$key} from '~/__generated__/StageTimerDisplay_meeting.graphql'
import StageTimerDisplayGauge from './StageTimerDisplayGauge'

interface Props {
  meeting: StageTimerDisplay_meeting$key
  canUndo?: boolean
}

const DisplayRow = styled('div')({
  display: 'flex',
  justifyContent: 'center',
  [`@media screen and (min-height: 800px) and (min-width: ${Breakpoint.SINGLE_REFLECTION_COLUMN}px)`]:
    {
      // for larger viewports: dont' want stuff to move when it turns on
      // adding a min-height, we lose too much vertical real estate when the timer is not used
      // todo: float over top bar when there’s room @ laptop+ breakpoint
      minHeight: 44
    }
})

const PhaseCompleteWrapper = styled('div')({
  alignItems: 'flex-start',
  display: 'flex'
})

const StageTimerDisplay = (props: Props) => {
  const atmosphere = useAtmosphere()
  const {meeting: meetingRef, canUndo} = props
  const meeting = useFragment(
    graphql`
      fragment StageTimerDisplay_meeting on NewMeeting {
        facilitatorUserId
        id
        localPhase {
          phaseType
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
    `,
    meetingRef
  )
  const {localPhase, localStage, facilitatorUserId} = meeting
  const {localScheduledEndTime, isComplete} = localStage
  const {stages, phaseType} = localPhase
  const isPhaseComplete = stages.every((stage) => stage.isComplete)
  const {viewerId} = atmosphere
  // scoping this to the group phase for a real retro
  const isDemo = isDemoRoute()
  const canUndoGroupPhase =
    !isDemo && canUndo && viewerId === facilitatorUserId && phaseType === 'group'
  return (
    <DisplayRow>
      {localScheduledEndTime && !isComplete ? (
        <StageTimerDisplayGauge endTime={localScheduledEndTime} />
      ) : null}
      {isPhaseComplete ? (
        <PhaseCompleteWrapper>
          <PhaseCompleteTag isComplete={isPhaseComplete} />
          {canUndoGroupPhase ? <UndoableGroupPhaseControl meetingId={meeting.id} /> : null}
        </PhaseCompleteWrapper>
      ) : null}
    </DisplayRow>
  )
}

graphql`
  fragment StageTimerDisplayStage on NewMeetingStage {
    id
    isComplete
    scheduledEndTime @__clientField(handle: "localTime")
    timeRemaining
    localScheduledEndTime
  }
`
export default StageTimerDisplay
