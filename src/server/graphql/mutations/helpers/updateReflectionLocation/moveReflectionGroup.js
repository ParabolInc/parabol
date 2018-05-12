import {
  sendPhaseItemNotFoundError,
  sendReflectionGroupNotFoundError
} from 'server/utils/docNotFoundErrors';
import {
  sendAlreadyCompletedMeetingPhaseError,
  sendAlreadyEndedMeetingError
} from 'server/utils/alreadyMutatedErrors';
import {isTeamMember} from 'server/utils/authorization';
import getRethink from 'server/database/rethinkDriver';
import {sendPhaseItemNotActiveError, sendTeamAccessError} from 'server/utils/authorizationErrors';
import isPhaseComplete from 'universal/utils/meetings/isPhaseComplete';
import {GROUP} from 'universal/utils/constants';

const moveReflectionGroup = async (
  reflectionGroupId,
  retroPhaseItemId,
  sortOrder,
  {authToken, dataLoader}
) => {
  const r = getRethink();
  const now = new Date();
  const reflectionGroup = await r.table('RetroReflectionGroup').get(reflectionGroupId);
  if (!reflectionGroup) {
    return sendReflectionGroupNotFoundError(authToken, reflectionGroupId);
  }
  const {meetingId} = reflectionGroup;
  const meeting = await dataLoader.get('newMeetings').load(meetingId);
  const {endedAt, phases, teamId} = meeting;
  if (!isTeamMember(authToken, teamId)) {
    return sendTeamAccessError(authToken, teamId);
  }
  if (endedAt) return sendAlreadyEndedMeetingError(authToken, meetingId);
  if (isPhaseComplete(GROUP, phases)) {
    return sendAlreadyCompletedMeetingPhaseError(authToken, GROUP);
  }
  const phaseItem = await dataLoader.get('customPhaseItems').load(retroPhaseItemId);
  if (!phaseItem || phaseItem.teamId !== teamId) {
    return sendPhaseItemNotFoundError(authToken, retroPhaseItemId);
  }
  if (!phaseItem.isActive) {
    return sendPhaseItemNotActiveError(authToken, retroPhaseItemId);
  }

  // RESOLUTION
  await r
    .table('RetroReflectionGroup')
    .get(reflectionGroupId)
    .update({
      retroPhaseItemId,
      sortOrder,
      updatedAt: now
    });
  return {meetingId, reflectionGroupId, teamId};
};

export default moveReflectionGroup;
