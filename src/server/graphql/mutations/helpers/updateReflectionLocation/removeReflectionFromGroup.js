import makeRetroGroupTitle from 'server/graphql/mutations/helpers/makeRetroGroupTitle';
import {isTeamMember} from 'server/utils/authorization';
import getRethink from 'server/database/rethinkDriver';
import {sendPhaseItemNotActiveError, sendTeamAccessError} from 'server/utils/authorizationErrors';
import {sendPhaseItemNotFoundError, sendReflectionNotFoundError} from 'server/utils/docNotFoundErrors';
import {sendAlreadyCompletedMeetingPhaseError, sendAlreadyEndedMeetingError} from 'server/utils/alreadyMutatedErrors';
import makeReflectionGroup from 'server/graphql/mutations/helpers/updateReflectionLocation/makeReflectionGroup';
import updateGroupTitle from 'server/graphql/mutations/helpers/updateReflectionLocation/updateGroupTitle';
import isPhaseComplete from 'universal/utils/meetings/isPhaseComplete';
import {GROUP} from 'universal/utils/constants';

const removeReflectionFromGroup = async (reflectionId, retroPhaseItemId, sortOrder, {authToken, dataLoader}) => {
  const r = getRethink();
  const now = new Date();
  const reflection = reflectionId && await r.table('RetroReflection').get(reflectionId);
  if (!reflection) return sendReflectionNotFoundError(authToken, reflectionId);
  const {reflectionGroupId: oldReflectionGroupId, meetingId} = reflection;
  const meeting = await dataLoader.get('newMeetings').load(meetingId);
  const {endedAt, phases, teamId} = meeting;
  if (!isTeamMember(authToken, teamId)) return sendTeamAccessError(authToken, teamId);
  if (endedAt) return sendAlreadyEndedMeetingError(authToken, meetingId);
  if (isPhaseComplete(GROUP, phases)) return sendAlreadyCompletedMeetingPhaseError(authToken, GROUP);
  const phaseItem = await dataLoader.get('customPhaseItems').load(retroPhaseItemId);
  if (!phaseItem || phaseItem.teamId !== teamId) return sendPhaseItemNotFoundError(authToken, retroPhaseItemId);
  if (!phaseItem.isActive) return sendPhaseItemNotActiveError(authToken, retroPhaseItemId);

  // RESOLUTION
  const reflectionGroup = await makeReflectionGroup(meetingId, retroPhaseItemId, sortOrder);
  const {id: reflectionGroupId} = reflectionGroup;
  await r.table('RetroReflection').get(reflectionId)
    .update({
      sortOrder: 0,
      reflectionGroupId,
      updatedAt: now
    });
  const oldReflections = await r.table('RetroReflection')
    .getAll(oldReflectionGroupId, {index: 'reflectionGroupId'})
    .filter({isActive: true});

  const {smartTitle: nextGroupSmartTitle, title: nextGroupTitle} = await makeRetroGroupTitle(meetingId, [reflection]);
  await updateGroupTitle(reflectionGroupId, nextGroupSmartTitle, nextGroupTitle);

  if (oldReflections.length > 0) {
    const {smartTitle: oldGroupSmartTitle, title: oldGroupTitle} = await makeRetroGroupTitle(meetingId, oldReflections);
    await updateGroupTitle(oldReflectionGroupId, oldGroupSmartTitle, oldGroupTitle);
  } else {
    await r.table('RetroReflectionGroup').get(oldReflectionGroupId)
      .update({
        isActive: false,
        updatedAt: now
      });
  }
  return {meetingId, reflectionId, reflectionGroupId, oldReflectionGroupId, teamId};
};

export default removeReflectionFromGroup;
