import graphql from 'babel-plugin-relay/macro'
import {readInlineData} from 'relay-runtime'
import type {reportMissingMeetingPhase_meeting$key} from '~/__generated__/reportMissingMeetingPhase_meeting.graphql'
import reportClientError from '../reportClientError'

// A meeting renders the phase its local stage is in, so the local state and stages say why it found none
const reportMissingMeetingPhase = (
  componentName: string,
  meetingRef: reportMissingMeetingPhase_meeting$key
) => {
  const meeting = readInlineData(
    graphql`
      fragment reportMissingMeetingPhase_meeting on NewMeeting @inline {
        id
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
  const {id: meetingId, facilitatorStageId, localPhase, localStage, phases} = meeting
  const stageIds = phases.flatMap(({stages}) => stages.map(({id}) => id))
  const describeStage = (stageId: string | undefined) =>
    stageId ? `${stageId} (${stageIds.includes(stageId) ? 'in' : 'not in'} the phases)` : 'unset'
  const error = new Error(
    `${componentName} found no phase for meeting ${meetingId}: localPhase ${localPhase?.id ?? 'unset'} ` +
      `of type ${localPhase?.phaseType ?? 'unset'}, localStage ${describeStage(localStage?.id)}, ` +
      `facilitatorStage ${describeStage(facilitatorStageId)}, ${phases.length} phases, ${stageIds.length} stages`
  )
  error.name = 'MissingMeetingPhase'
  reportClientError(error)
}

export default reportMissingMeetingPhase
