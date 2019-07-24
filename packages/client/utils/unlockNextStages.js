import findStageAfterId from './meetings/findStageAfterId'
import findStageById from './meetings/findStageById'
import unlockAllStagesForPhase from './unlockAllStagesForPhase'
import {DISCUSS, GROUP} from './constants'

const phasesWithExtraRequirements = [GROUP, DISCUSS]

const unlockStagesForParticipants = (facilitatorStageId, phases) => {
  const stageRes = findStageById(phases, facilitatorStageId)
  if (!stageRes) return []
  const {stage} = stageRes
  if (stage.isNavigable) return []
  return unlockAllStagesForPhase(phases, stage.phaseType, false)
}

const unlockNextStageForFacilitator = (facilitatorStageId, phases) => {
  const nextStageRes = findStageAfterId(phases, facilitatorStageId)
  if (!nextStageRes) return []
  const {stage: nextStage} = nextStageRes
  if (nextStage.isNavigableByFacilitator) return []
  if (phasesWithExtraRequirements.includes(nextStage.phaseType)) return []
  return unlockAllStagesForPhase(phases, nextStage.phaseType, true)
}

const unlockNextStages = (facilitatorStageId, phases) => {
  const unlockedFacilitatorStageIds = unlockNextStageForFacilitator(facilitatorStageId, phases)
  const unlockedParticipantStageIds = unlockStagesForParticipants(facilitatorStageId, phases)
  return [...unlockedFacilitatorStageIds, ...unlockedParticipantStageIds]
}

export default unlockNextStages
