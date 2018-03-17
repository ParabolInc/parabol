const findStageBeforeId = (phases, stageId) => {
  if (!phases) return undefined;
  let stageFound = false;
  for (let ii = phases.length - 1; ii >= 0; ii--) {
    const phase = phases[ii];
    const {stages} = phase;
    for (let jj = stages.length - 1; jj >= 0; jj--) {
      const stage = stages[jj];
      if (stageFound === true) {
        return {phase, stage};
      }
      if (stage.id === stageId) {
        stageFound = true;
      }
    }
  }
  return undefined;
};

export default findStageBeforeId;
