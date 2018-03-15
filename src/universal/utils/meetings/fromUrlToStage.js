import {matchPath} from 'react-router-dom';

const fromUrlToStage = (phases) => {
  const {params: {phaseType, stageIdx}} = matchPath(location.pathname, {
    path: '/:meetingType/:teamId/:phaseType/:stageIdx'
  });
  const phase = phases.find((curPhase) => curPhase.phaseType === phaseType);
  return phase ? phase.stages[stageIdx - 1] : undefined;
};

export default fromUrlToStage;
