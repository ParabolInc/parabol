// @flow

import type {NewMeetingPhaseTypeEnum} from 'universal/types/schema.flow';

const findFirstStageInPhase = (phases: $ReadOnlyArray<Object>, phaseType: NewMeetingPhaseTypeEnum) => {
  if (!phases) return undefined;
  for (let ii = 0; ii < phases.length; ii++) {
    const phase = phases[ii];
    const {stages} = phase;
    if (phase.phaseType === phaseType) {
      return {stage: stages[0], phase};
    }
  }
  return undefined;
};

export default findFirstStageInPhase;
