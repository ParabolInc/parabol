import findStageBeforeId from 'universal/utils/meetings/findStageBeforeId';

const facilitatorCanNavigateToStage = (phases, stageId) => {
  // i can go to the itemStage as long as it is <= meetingStage +1
  let atMeetingStage;
  for (let ii = 0; ii < phases.length; ii++) {
    const phase = phases[ii];
    const {stages} = phase;
    for (let jj = 0; jj < stages.length; jj++) {
      const stage = stages[jj];
      if (stage.id === stageId) return true;
      if (atMeetingStage) return false;
      if (!stage.isComplete) {
        atMeetingStage = true;
      }
    }
  }
  return false;
};

const getIsNavigable = (isViewerFacilitator, phases, stageId) => {
  if (!stageId) return false;
  if (isViewerFacilitator) {
    return facilitatorCanNavigateToStage(phases, stageId);
  }
  // the first is always free
  if (phases[0].stages[0].id === stageId) return true;
  const {stage} = findStageBeforeId(phases, stageId);
  return stage.isComplete;
};

export default getIsNavigable;
