import {GraphQLFloat, GraphQLID, GraphQLNonNull} from 'graphql';
import getRethink from 'server/database/rethinkDriver';
import {isTeamMember} from 'server/utils/authorization';
import {sendPhaseItemNotActiveError, sendTeamAccessError} from 'server/utils/authorizationErrors';
import UpdateReflectionLocationPayload from 'server/graphql/types/UpdateReflectionLocationPayload';
import {sendPhaseItemNotFoundError, sendReflectionGroupNotFoundError, sendReflectionNotFoundError} from 'server/utils/docNotFoundErrors';
import {sendAlreadyCompletedMeetingPhaseError, sendAlreadyEndedMeetingError} from 'server/utils/alreadyMutatedErrors';
import publish from 'server/utils/publish';
import {GROUP, TEAM} from 'universal/utils/constants';
import isPhaseComplete from 'universal/utils/meetings/isPhaseComplete';
import * as shortid from 'shortid';
import removeEmptyReflectionGroup from 'server/graphql/mutations/helpers/removeEmptyReflectionGroup';

const upsertReflectionGroup = async (reflectionGroupId, meetingId, retroPhaseItemId, sortOrder) => {
  const r = getRethink();
  const now = new Date();
  if (reflectionGroupId !== null) return reflectionGroupId;
  // the reflection was dragged out on its own, create a new group
  const reflectionGroup = {
    id: shortid.generate(),
    createdAt: now,
    isActive: true,
    meetingId,
    retroPhaseItemId,
    sortOrder,
    updatedAt: now,
    voterIds: []
  };
  await r.table('RetroReflectionGroup').insert(reflectionGroup);
  return reflectionGroup.id;
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
      type: new GraphQLNonNull(GraphQLFloat),
      description: 'the new in-group sort order if reflectionGroupId is provided, else the phase item sort order'
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
    if (isPhaseComplete(GROUP, phases)) return sendAlreadyCompletedMeetingPhaseError(authToken, GROUP);

    // VALIDATION
    if (retroPhaseItemId) {
      const phaseItem = await dataLoader.get('customPhaseItems').load(retroPhaseItemId);
      if (!phaseItem || phaseItem.teamId !== teamId) return sendPhaseItemNotFoundError(authToken, retroPhaseItemId);
      if (!phaseItem.isActive) return sendPhaseItemNotActiveError(authToken, retroPhaseItemId);
    }

    if (reflectionGroupId) {
      const reflectionGroup = await dataLoader.get('retroReflectionGroups').load(reflectionGroupId);
      if (!reflectionGroup) return sendReflectionGroupNotFoundError(authToken, reflectionGroupId);
      if (reflectionGroup.meetingId !== meetingId) return sendReflectionGroupNotFoundError(authToken, reflectionGroupId);
    }
    // RESOLUTION
    const nextReflectionGroupId = await upsertReflectionGroup(reflectionGroupId, meetingId, retroPhaseItemId, sortOrder);

    await r.table('RetroReflection').get(reflectionId)
      .update({
        sortOrder: nextReflectionGroupId === reflectionGroupId ? sortOrder : 0,
        reflectionGroupId: nextReflectionGroupId,
        retroPhaseItemId,
        updatedAt: now
      });
    await removeEmptyReflectionGroup(reflectionGroupId, oldReflectionGroupId);
    const data = {meetingId, reflectionId, reflectionGroupId: nextReflectionGroupId, oldReflectionGroupId};
    publish(TEAM, teamId, UpdateReflectionLocationPayload, data, subOptions);
    return data;
  }
};

