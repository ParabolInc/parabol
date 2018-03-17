// @flow
import getMeetingPathParams from 'universal/utils/meetings/getMeetingPathParams';
import type {NewMeetingPhaseTypeEnum} from 'universal/types/schema.flow';

const findStageByUrl = (phases: NewMeetingPhaseTypeEnum) => {
  if (!Array.isArray(phases)) return {};
  const {phaseType, stageIdx} = getMeetingPathParams();
  const phase = phases.find((curPhase) => curPhase.phaseType === phaseType);
  if (!phase) return {};
  const stage = phase.stages[stageIdx];
  return {stage, phase, stageIdx};
};

export default findStageByUrl;
