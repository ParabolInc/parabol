import {GraphQLFloat, GraphQLID, GraphQLNonNull} from 'graphql';
import getRethink from 'server/database/rethinkDriver';
import {isTeamMember} from 'server/utils/authorization';
import {sendPhaseItemNotActiveError, sendTeamAccessError} from 'server/utils/authorizationErrors';
import UpdateReflectionLocationPayload from 'server/graphql/types/UpdateReflectionLocationPayload';
import {sendPhaseItemNotFoundError, sendReflectionGroupNotFoundError, sendReflectionNotFoundError} from 'server/utils/docNotFoundErrors';
import {sendAlreadyEndedMeetingError} from 'server/utils/alreadyMutatedErrors';
import publish from 'server/utils/publish';
import {TEAM} from 'universal/utils/constants';
import * as shortid from 'shortid';
import removeEmptyReflectionGroup from 'server/graphql/mutations/helpers/removeEmptyReflectionGroup';

const ensureReflectionGroup = async (reflectionGroupId, meetingId, retroPhaseItemId, sortOrder) => {
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
      type: GraphQLID,
      description: 'null if the group is being moved'
    },
    retroPhaseItemId: {
      type: GraphQLID,
      description: 'The phase item the reflection group should move to'
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

    // group-to-group movement requires reflectionId and reflectionGroupId
    // group-to-single (ie removing from group) movement requires reflectionId, retroPhaseItemId, and a null reflectionGroupId
    // moving a group requires reflectionGroupId & retroPhaseItemId

    // AUTH
    if (!reflectionId && !reflectionGroupId) return sendReflectionNotFoundError(authToken, reflectionId);
    if (reflectionGroupId === null && !retroPhaseItemId) return sendReflectionGroupNotFoundError(authToken, null);

    const reflection = reflectionId && await r.table('RetroReflection').get(reflectionId);
    const reflectionGroup = reflectionGroupId && await r.table('RetroReflectionGroup').get(reflectionGroupId);
    if (!reflection && !reflectionGroup) return sendReflectionNotFoundError(authToken, reflectionId);
    const {meetingId} = reflection || reflectionGroup;
    const oldReflectionGroupId = reflection ? reflection.reflectionGroupId : reflectionGroupId;
    const meeting = await dataLoader.get('newMeetings').load(meetingId);
    const {endedAt, phases, teamId} = meeting;
    if (!isTeamMember(authToken, teamId)) return sendTeamAccessError(authToken, teamId);
    if (endedAt) return sendAlreadyEndedMeetingError(authToken, meetingId);
    // TODO uncomment in prod
    // if (isPhaseComplete(GROUP, phases)) return sendAlreadyCompletedMeetingPhaseError(authToken, GROUP);

    // VALIDATION
    if (retroPhaseItemId) {
      const phaseItem = await dataLoader.get('customPhaseItems').load(retroPhaseItemId);
      if (!phaseItem || phaseItem.teamId !== teamId) return sendPhaseItemNotFoundError(authToken, retroPhaseItemId);
      if (!phaseItem.isActive) return sendPhaseItemNotActiveError(authToken, retroPhaseItemId);
    }
    if (reflectionGroup && reflectionGroup.meetingId !== meetingId) sendReflectionGroupNotFoundError(authToken, reflectionGroupId);

    // RESOLUTION
    const nextReflectionGroupId = await ensureReflectionGroup(reflectionGroupId, meetingId, retroPhaseItemId, sortOrder);
    if (reflection) {
      await r.table('RetroReflection').get(reflectionId)
        .update({
          sortOrder: nextReflectionGroupId === reflectionGroupId ? sortOrder : 0,
          reflectionGroupId: nextReflectionGroupId,
          updatedAt: now
        });
    } else {
      await r.table('RetroReflectionGroup')
        .get(nextReflectionGroupId)
        .update({
          retroPhaseItemId: retroPhaseItemId || undefined,
          sortOrder,
          updatedAt: now
        });
    }
    await removeEmptyReflectionGroup(reflectionGroupId, oldReflectionGroupId);
    const data = {meetingId, reflectionId, reflectionGroupId: nextReflectionGroupId, oldReflectionGroupId};
    publish(TEAM, teamId, UpdateReflectionLocationPayload, data, subOptions);
    return data;
  }
};

