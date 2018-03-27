import {GraphQLFloat, GraphQLID, GraphQLNonNull} from 'graphql';
import getRethink from 'server/database/rethinkDriver';
import {isTeamMember} from 'server/utils/authorization';
import {sendPhaseItemNotActiveError, sendTeamAccessError} from 'server/utils/authorizationErrors';
import UpdateReflectionLocationPayload from 'server/graphql/types/UpdateReflectionLocationPayload';
import {sendPhaseItemNotFoundError, sendReflectionGroupNotFoundError, sendReflectionNotFoundError} from 'server/utils/docNotFoundErrors';
import {sendAlreadyCompletedMeetingPhaseError, sendAlreadyEndedMeetingError} from 'server/utils/alreadyMutatedErrors';
import publish from 'server/utils/publish';
import {REFLECT, TEAM} from 'universal/utils/constants';
import isPhaseComplete from 'universal/utils/meetings/isPhaseComplete';

const getOrphanedReflectionId = async (reflectionGroupId, oldReflectionGroupId) => {
  const r = getRethink();
  if (reflectionGroupId !== null) return undefined;
  const remainingReflectionIds = await r.table('RetroReflection')
    .getAll(oldReflectionGroupId, {index: 'reflectionGroupId'})
    .filter({isActive: true})('id')
    .default([]);
  if (remainingReflectionIds.length === 1) {
    return remainingReflectionIds[0];
  }
  return undefined;
};

export default {
  type: UpdateReflectionLocationPayload,
  description: 'Update the sortOrder or phaseItemId of a reflection (usually by dragging it)',
  args: {
    reflectionId: {
      type: new GraphQLNonNull(GraphQLID)
    },
    retroPhaseItemId: {
      type: GraphQLID,
      description: 'The phase item the reflection belongs to'
    },
    sortOrder: {
      type: new GraphQLNonNull(GraphQLFloat)
    },
    reflectionGroupId: {
      type: GraphQLID,
      description: 'The new group the reflection is a part of (or leaving, if null)'
    }
  },
  async resolve(source, {reflectionId, reflectionGroupId, retroPhaseItemId, sortOrder}, {authToken, dataLoader, socketId: mutatorId}) {
    const r = getRethink();
    const operationId = dataLoader.share();
    const now = new Date();
    const subOptions = {operationId, mutatorId};

    // AUTH
    const reflection = await r.table('RetroReflection').get(reflectionId);
    if (!reflection) return sendReflectionNotFoundError(authToken, reflectionId);
    const {meetingId, reflectionGroupId: oldReflectionGroupId} = reflection;
    const meeting = await dataLoader.get('newMeetings').load(meetingId);
    const {endedAt, phases, teamId} = meeting;
    if (!isTeamMember(authToken, teamId)) return sendTeamAccessError(authToken, teamId);
    if (endedAt) return sendAlreadyEndedMeetingError(authToken, meetingId);
    if (isPhaseComplete(REFLECT, phases)) return sendAlreadyCompletedMeetingPhaseError(authToken, REFLECT);

    // VALIDATION
    const phaseItem = await dataLoader.get('customPhaseItems').load(retroPhaseItemId);
    if (!phaseItem || phaseItem.teamId !== teamId) return sendPhaseItemNotFoundError(authToken, retroPhaseItemId);
    if (!phaseItem.isActive) return sendPhaseItemNotActiveError(authToken, retroPhaseItemId);

    if (reflectionGroupId) {
      const reflectionGroup = await dataLoader.get('retroReflectionGroups').load(reflectionGroupId);
      if (!reflectionGroup) return sendReflectionGroupNotFoundError(authToken, reflectionGroupId);
      if (reflectionGroup.meetingId !== meetingId) return sendReflectionGroupNotFoundError(authToken, reflectionGroupId);
    }
    // RESOLUTION
    await r.table('RetroReflection').get(reflectionId)
      .update({
        sortOrder,
        reflectionGroupId,
        retroPhaseItemId,
        updatedAt: now
      });
    const orphanedReflectionId = getOrphanedReflectionId(reflectionGroupId, oldReflectionGroupId);
    const removedGroupId = orphanedReflectionId ? oldReflectionGroupId : undefined;
    if (orphanedReflectionId) {
      await r({
        reflection: r.table('RetroReflection')
          .get(orphanedReflectionId)
          .update({
            reflectionGroupId: null,
            updatedAt: now
          }),
        group: r.table('RetroReflectionGroup')
          .get(oldReflectionGroupId)
          .update({
            isActive: false,
            updatedAt: now
          })
      });
    }

    const data = {meetingId, reflectionId, orphanedReflectionId, removedGroupId};
    publish(TEAM, teamId, UpdateReflectionLocationPayload, data, subOptions);
    return data;
  }
};

