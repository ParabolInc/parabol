import findStageAfterId from 'parabol-client/utils/meetings/findStageAfterId'
import findStageBeforeId from 'parabol-client/utils/meetings/findStageBeforeId'
import findStageById from 'parabol-client/utils/meetings/findStageById'
import GenericMeetingPhase from '../../../database/types/GenericMeetingPhase'
import GenericMeetingStage from '../../../database/types/GenericMeetingStage'

const getNextFacilitatorStageAfterStageRemoved = (
  facilitatorStageId: string | undefined,
  removedStageId: string,
  phases: readonly GenericMeetingPhase[]
) => {
  const facilitatorOnStage = facilitatorStageId === removedStageId
  if (!facilitatorOnStage) {
    const {stage} = findStageById(phases, facilitatorStageId)!
    return stage
  }
  // get the next stage. if this is the last stage, get the previous one
  const nextStageRes = (findStageAfterId(phases, removedStageId) ||
    findStageBeforeId(phases, removedStageId))!
  return nextStageRes.stage as GenericMeetingStage
}

export default getNextFacilitatorStageAfterStageRemoved
