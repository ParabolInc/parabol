// @flow


// import type {NewMeetingPhase} from 'universal/types/schema.flow';

const findStageAfterId = (phases: $ReadOnlyArray<Object>, stageId: string) => {
  if (!phases) return undefined;
  let stageFound = false;
  for (let ii = 0; ii < phases.length; ii++) {
    const phase = phases[ii];
    const {stages} = phase;
    for (let jj = 0; jj < stages.length; jj++) {
      const stage = stages[jj];
      if (stageFound === true) {
        return {phase, stage, stageIdx: jj};
      }
      if (stage.id === stageId) {
        stageFound = true;
      }
    }
  }
  return undefined;
};

export default findStageAfterId;
