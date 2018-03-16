// @flow
import {matchPath} from 'react-router-dom';
import type {NewMeetingPhaseTypeEnum} from 'universal/types/schema.flow';

type MeetingParams = {
  meetingSlug: string,
  teamId: string,
  phaseType?: NewMeetingPhaseTypeEnum,
  stageIdx?: number
}

const getMeetingPathParams = (): MeetingParams => {
  const matchRes = matchPath(location.pathname, {
    path: '/:meetingSlug/:teamId/:phaseType?/:stageIdx?'
  });
  return matchRes && matchRes.params || {};
};

export default getMeetingPathParams;
