import getMeetingPathParams from 'universal/utils/meetings/getMeetingPathParams';

const fromUrlToStage = (phases) => {
  const {phaseType, stageIdx} = getMeetingPathParams();
  const phase = phases.find((curPhase) => curPhase.phaseType === phaseType);
  return phase ? phase.stages[stageIdx - 1] : undefined;
};

export default fromUrlToStage;
