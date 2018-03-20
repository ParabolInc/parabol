import {GraphQLID, GraphQLNonNull, GraphQLString} from 'graphql';
import getRethink from 'server/database/rethinkDriver';
import {isTeamMember} from 'server/utils/authorization';
import {sendTeamAccessError} from 'server/utils/authorizationErrors';
import UpdateReflectionContentPayload from 'server/graphql/types/UpdateReflectionContentPayload';
import {sendReflectionNotFoundError} from 'server/utils/docNotFoundErrors';
import {sendAlreadyCompletedMeetingPhaseError, sendAlreadyEndedMeetingError} from 'server/utils/alreadyMutatedErrors';
import normalizeRawDraftJS from 'universal/validation/normalizeRawDraftJS';
import publish from 'server/utils/publish';
import {REFLECT, TEAM} from 'universal/utils/constants';
import isPhaseComplete from 'universal/utils/meetings/isPhaseComplete';

export default {
  type: UpdateReflectionContentPayload,
  description: 'Update the content of a reflection',
  args: {
    reflectionId: {
      type: new GraphQLNonNull(GraphQLID)
    },
    content: {
      type: GraphQLString,
      description: 'A stringified draft-js document containing thoughts'
    }
  },
  async resolve(source, {reflectionId, content}, {authToken, dataLoader, socketId: mutatorId}) {
    const r = getRethink();
    const operationId = dataLoader.share();
    const now = new Date();
    const subOptions = {operationId, mutatorId};

    // AUTH
    const reflection = await r.table('RetroReflection').get(reflectionId);
    if (!reflection) return sendReflectionNotFoundError(authToken, reflectionId);
    const {meetingId} = reflection;
    const meeting = await dataLoader.get('newMeetings').load(meetingId);
    const {endedAt, phases, teamId} = meeting;
    if (!isTeamMember(authToken, teamId)) return sendTeamAccessError(authToken, teamId);
    if (endedAt) return sendAlreadyEndedMeetingError(authToken, meetingId);
    if (isPhaseComplete(REFLECT, phases)) return sendAlreadyCompletedMeetingPhaseError(authToken, REFLECT);

    // VALIDATION
    const normalizedContent = normalizeRawDraftJS(content);

    // RESOLUTION
    await r.table('RetroReflection').get(reflectionId)
      .update({
        content: normalizedContent,
        updatedAt: now
      });

    const data = {meetingId, reflectionId};
    publish(TEAM, teamId, UpdateReflectionContentPayload, data, subOptions);
    return data;
  }
};

