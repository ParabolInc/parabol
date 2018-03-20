import {GraphQLID, GraphQLNonNull} from 'graphql';
import getRethink from 'server/database/rethinkDriver';
import {getUserId, isTeamMember} from 'server/utils/authorization';
import {sendReflectionAccessError, sendTeamAccessError} from 'server/utils/authorizationErrors';
import {sendReflectionNotFoundError} from 'server/utils/docNotFoundErrors';
import {sendAlreadyCompletedMeetingPhaseError, sendAlreadyEndedMeetingError} from 'server/utils/alreadyMutatedErrors';
import publish from 'server/utils/publish';
import {REFLECT, TEAM} from 'universal/utils/constants';
import isPhaseComplete from 'universal/utils/meetings/isPhaseComplete';
import RemoveReflectionPayload from 'server/graphql/types/RemoveReflectionPayload';

export default {
  type: RemoveReflectionPayload,
  description: 'Remove a reflection',
  args: {
    reflectionId: {
      type: new GraphQLNonNull(GraphQLID)
    }
  },
  async resolve(source, {reflectionId}, {authToken, dataLoader, socketId: mutatorId}) {
    const r = getRethink();
    const operationId = dataLoader.share();
    const now = new Date();
    const subOptions = {operationId, mutatorId};

    // AUTH
    const viewerId = getUserId(authToken);
    const reflection = await r.table('RetroReflection').get(reflectionId);
    if (!reflection) return sendReflectionNotFoundError(authToken, reflectionId);
    const {creatorId, meetingId} = reflection;
    if (creatorId !== viewerId) return sendReflectionAccessError(authToken, reflectionId);
    const meeting = await dataLoader.get('newMeetings').load(meetingId);
    const {endedAt, phases, teamId} = meeting;
    if (!isTeamMember(authToken, teamId)) return sendTeamAccessError(authToken, teamId);
    if (endedAt) return sendAlreadyEndedMeetingError(authToken, meetingId);
    if (isPhaseComplete(REFLECT, phases)) return sendAlreadyCompletedMeetingPhaseError(authToken, REFLECT);

    // RESOLUTION
    await r.table('RetroReflection').get(reflectionId)
      .update({
        isActive: false,
        updatedAt: now
      });

    const data = {meetingId, reflectionId};
    publish(TEAM, teamId, RemoveReflectionPayload, data, subOptions);
    return data;
  }
};

