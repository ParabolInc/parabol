import {matchPath} from 'react-router-dom';

const fromUrlToStageId = (phases) => {
  const {params: {phaseType, stageIdx}} = matchPath(location.pathname, {
    path: '/:meetingType/:teamId/:phaseType/:stageIdx'
  });
  const phase = phases.find((curPhase) => curPhase.phaseType === phaseType);
  return phase.stages[stageIdx - 1].id;
};

export default fromUrlToStageId;
