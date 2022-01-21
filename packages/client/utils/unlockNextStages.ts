import GenericMeetingPhase from '~/../server/database/types/GenericMeetingPhase'
import {DISCUSS, GROUP} from './constants'
import findStageAfterId from './meetings/findStageAfterId'
import findStageById from './meetings/findStageById'
import unlockAllStagesForPhase from './unlockAllStagesForPhase'

const phasesWithExtraRequirements = [GROUP, DISCUSS]

const unlockStagesForParticipants = (facilitatorStageId: string, phases: GenericMeetingPhase[]) => {
  const stageRes = findStageById(phases, facilitatorStageId)
  if (!stageRes) return []
  const {stage} = stageRes as any
  if (stage.isNavigable) return []
  return unlockAllStagesForPhase(phases, stage.phaseType, false)
}

const unlockNextStageForFacilitator = (
  facilitatorStageId: string,
  phases: GenericMeetingPhase[]
) => {
  const nextStageRes = findStageAfterId(phases, facilitatorStageId)
  if (!nextStageRes) return []
  const {stage: nextStage} = nextStageRes as any
  if (nextStage.isNavigableByFacilitator) return []
  if (phasesWithExtraRequirements.includes(nextStage.phaseType)) return []
  return unlockAllStagesForPhase(phases, nextStage.phaseType, true)
}

const unlockNextStages = (facilitatorStageId: string, phases: GenericMeetingPhase[]) => {
  const unlockedFacilitatorStageIds = unlockNextStageForFacilitator(facilitatorStageId, phases)
  const unlockedParticipantStageIds = unlockStagesForParticipants(facilitatorStageId, phases)
  return [...unlockedFacilitatorStageIds, ...unlockedParticipantStageIds]
}

export default unlockNextStages
