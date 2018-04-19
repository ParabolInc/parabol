// @flow

const getIsNavigable = (isViewerFacilitator: boolean, phases: $ReadOnlyArray<Object>, stageId: string) => {
  if (!stageId) return false;
  const facilitatorBonus = Number(isViewerFacilitator);
  let meetingPhaseIdx;
  for (let ii = 0; ii < phases.length; ii++) {
    // only let them go to the next phase
    if (meetingPhaseIdx !== undefined && ii > meetingPhaseIdx + facilitatorBonus) return false;
    const phase = phases[ii];
    const {stages} = phase;
    for (let jj = 0; jj < stages.length; jj++) {
      const stage = stages[jj];
      // if they go to the next phase, only let them go to the first stage
      if (meetingPhaseIdx !== undefined && ii > meetingPhaseIdx && jj > 0) return false;
      if (stage.id === stageId) return true;
      if (!stage.isComplete) {
        meetingPhaseIdx = ii;
      }
    }
  }
  return false;
};

export default getIsNavigable;
