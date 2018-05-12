// @flow

// import type {NewMeetingPhase} from 'universal/types/schema.flow';

const findMeetingStage = (phases: $ReadOnlyArray<Object>) => {
  if (!phases) return undefined;
  for (let ii = 0; ii < phases.length; ii++) {
    const phase = phases[ii];
    const {stages} = phase;
    for (let jj = 0; jj < stages.length; jj++) {
      const stage = stages[jj];
      if (!stage.isComplete) {
        return {stage, phase};
      }
    }
  }
  return undefined;
};

export default findMeetingStage;
