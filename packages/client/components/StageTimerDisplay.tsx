import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import type {StageTimerDisplay_meeting$key} from '~/__generated__/StageTimerDisplay_meeting.graphql'
import PhaseCompleteTag from '~/components/Tag/PhaseCompleteTag'
import UndoableGroupPhaseControl from '~/components/UndoableGroupPhaseControl'
import useAtmosphere from '~/hooks/useAtmosphere'
import isDemoRoute from '~/utils/isDemoRoute'
import StageTimerDisplayGauge from './StageTimerDisplayGauge'

interface Props {
  meeting: StageTimerDisplay_meeting$key
  canUndo?: boolean
}

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
    <div className='flex justify-center [@media_screen_and_(min-height:800px)_and_(min-width:704px)]:min-h-11'>
      {localScheduledEndTime && !isComplete ? (
        <StageTimerDisplayGauge endTime={localScheduledEndTime} />
      ) : null}
      {isPhaseComplete ? (
        <div className='flex items-start'>
          <PhaseCompleteTag isComplete={isPhaseComplete} />
          {canUndoGroupPhase ? <UndoableGroupPhaseControl meetingId={meeting.id} /> : null}
        </div>
      ) : null}
    </div>
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
