// @flow

const getIsNavigable = (isViewerFacilitator: boolean, phases: $ReadOnlyArray<Object>, stageId: string) => {
  if (!stageId) return false;
  const facilitatorBonus = Number(isViewerFacilitator);
  const meetingPhaseIdx = phases.findIndex((phase, idx) => (phase.stages[0] && !phase.stages[0].isComplete) || idx === phases.length - 1);
  for (let ii = 0; ii < phases.length; ii++) {
    // only let them go to the next phase
    if (ii > meetingPhaseIdx + facilitatorBonus) return false;
    const phase = phases[ii];
    const {stages} = phase;
    for (let jj = 0; jj < stages.length; jj++) {
      const stage = stages[jj];
      // if they go to the next phase, only let them go to the first stage
      if (ii > meetingPhaseIdx && jj > 0) return false;
      if (stage.id === stageId) return true;
    }
  }
  return false;
};

export default getIsNavigable;
