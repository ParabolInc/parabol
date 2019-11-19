import GenericMeetingPhase from '../../../database/types/GenericMeetingPhase'
import findStageById from '../../../../client/utils/meetings/findStageById'
import findStageAfterId from '../../../../client/utils/meetings/findStageAfterId'
import findStageBeforeId from '../../../../client/utils/meetings/findStageBeforeId'
import GenericMeetingStage from '../../../database/types/GenericMeetingStage'

const getNextFacilitatorStageAfterStageRemoved = (
  facilitatorStageId: string,
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
