import graphql from 'babel-plugin-relay/macro'
import {readInlineData} from 'relay-runtime'
import type {getMissingMeetingPhaseError_meeting$key} from '~/__generated__/getMissingMeetingPhaseError_meeting.graphql'

// A meeting renders the phase its local stage is in, so the local state and stages say why it found none
const getMissingMeetingPhaseError = (meetingRef: getMissingMeetingPhaseError_meeting$key) => {
  const meeting = readInlineData(
    graphql`
      fragment getMissingMeetingPhaseError_meeting on NewMeeting @inline {
        id
        meetingType
        facilitatorStageId
        localPhase {
          id
          phaseType
        }
        localStage {
          id
        }
        phases {
          stages {
            id
          }
        }
      }
    `,
    meetingRef
  )
  const {id: meetingId, meetingType, facilitatorStageId, localPhase, localStage, phases} = meeting
  const stageIds = phases.flatMap(({stages}) => stages.map(({id}) => id))
  const describeStage = (stageId: string | undefined) =>
    stageId ? `${stageId} (${stageIds.includes(stageId) ? 'in' : 'not in'} the phases)` : 'unset'
  const error = new Error(
    `${meetingType} meeting ${meetingId} has no phase to show: localPhase ${localPhase?.id ?? 'unset'} ` +
      `of type ${localPhase?.phaseType ?? 'unset'}, localStage ${describeStage(localStage?.id)}, ` +
      `facilitatorStage ${describeStage(facilitatorStageId)}, ${phases.length} phases, ${stageIds.length} stages`
  )
  error.name = 'MissingMeetingPhase'
  return error
}

export default getMissingMeetingPhaseError
