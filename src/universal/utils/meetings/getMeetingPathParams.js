// @flow
/*
 * Avoid this if you can! Everything should be stored under localStage and localPhase already.
 * Grabbing state from the url is non-deterministic depending on when a component updates!
 */
import {matchPath} from 'react-router-dom';
import type {MeetingTypeEnum, NewMeetingPhaseTypeEnum} from 'universal/types/schema.flow';
import findKeyByValue from 'universal/utils/findKeyByValue';
import {meetingTypeToSlug, phaseTypeToSlug} from 'universal/utils/meetings/lookups';

type MeetingParams = {
  meetingSlug?: ?string,
  meetingType?: ?MeetingTypeEnum | string,
  teamId?: ?string,
  phaseSlug?: ?string,
  phaseType?: ?NewMeetingPhaseTypeEnum | string,
  stageIdx?: ?number
};

const getMeetingPathParams = (): MeetingParams => {
  const matchRes = matchPath(location.pathname, {
    path: '/:meetingSlug/:teamId/:phaseSlug?/:stageIdxSlug?'
  });
  if (!matchRes) return {};
  const {
    params: {meetingSlug, teamId, phaseSlug, stageIdxSlug}
  } = matchRes;
  return {
    meetingSlug,
    meetingType: findKeyByValue(meetingTypeToSlug, meetingSlug),
    phaseSlug,
    phaseType: findKeyByValue(phaseTypeToSlug, phaseSlug),
    stageIdx: stageIdxSlug ? Number(stageIdxSlug) - 1 : undefined,
    stageIdxSlug,
    teamId
  };
};

export default getMeetingPathParams;
