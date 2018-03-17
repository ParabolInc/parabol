const findStageById = (phases, stageId) => {
  if (!phases) return undefined;
  for (let ii = 0; ii < phases.length; ii++) {
    const phase = phases[ii];
    const {stages} = phase;
    for (let jj = 0; jj < stages.length; jj++) {
      const stage = stages[jj];
      if (stage.id === stageId) {
        return {phase, stage, stageIdx: jj};
      }
    }
  }
  return undefined;
};

export default findStageById;
