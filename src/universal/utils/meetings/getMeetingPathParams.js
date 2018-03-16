// @flow
import {matchPath} from 'react-router-dom';

const getMeetingPathParams = () => {
  const matchRes = matchPath(location.pathname, {
    path: '/:meetingSlug/:teamId/:phaseType/:stageIdx'
  });
  return matchRes && matchRes.params || {};
};

export default getMeetingPathParams;
