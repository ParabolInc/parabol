import findStageAfterId from 'universal/utils/meetings/findStageAfterId';
import findStageById from 'universal/utils/meetings/findStageById';
import unlockAllStagesForPhase from 'server/graphql/mutations/helpers/unlockAllStagesForPhase';
import {DISCUSS, GROUP} from 'universal/utils/constants';

const phasesWithExtraRequirements = [GROUP, DISCUSS];

const unlockStagesForParticipants = (facilitatorStageId, phases) => {
  const stage = findStageById(phases, facilitatorStageId);
  if (stage.isNavigable) return [];
  return unlockAllStagesForPhase(phases, stage.phaseType, false);
}

const unlockNextStageForFacilitator = (facilitatorStageId, phases) => {
  const nextStage = findStageAfterId(phases, facilitatorStageId);
  if (nextStage.isNavigableByFacilitator) return [];
  if (phasesWithExtraRequirements.includes(nextStage.phaseType)) return [];
  return unlockAllStagesForPhase(phases, nextStage.phaseType, true);
}

const unlockNextStages = async (facilitatorStageId, phases) => {
  const unlockedFacilitatorStageIds = unlockNextStageForFacilitator(facilitatorStageId, phases);
  const unlockedParticipantStageIds = unlockStagesForParticipants(facilitatorStageId, phases);
  return [...unlockedFacilitatorStageIds, ...unlockedParticipantStageIds];
}

export default unlockNextStages;
