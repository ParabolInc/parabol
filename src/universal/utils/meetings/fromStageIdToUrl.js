import {meetingTypeToSlug, phaseIsMultiStage, phaseTypeToSlug} from 'universal/utils/meetings/lookups';
import findStageById from 'universal/utils/meetings/findStageById';

const fromStageIdToUrl = (stageId, phases, teamId, meetingType) => {
  const stageRes = findStageById(phases, stageId);
  if (!stageRes) return undefined;
  const {phase, stageIdx} = stageRes;
  const {phaseType} = phase;
  const phaseSlug = phaseTypeToSlug[phaseType];
  const meetingSlug = meetingTypeToSlug[meetingType];
  const isPhaseMultiStage = phaseIsMultiStage[phaseType];
  const maybeStage = isPhaseMultiStage ? `/${stageIdx + 1}` : '';
  return `/${meetingSlug}/${teamId}/${phaseSlug}${maybeStage}`;
};

export default fromStageIdToUrl;
