import {GraphQLFloat, GraphQLID, GraphQLNonNull} from 'graphql';
import getRethink from 'server/database/rethinkDriver';
import {isTeamMember} from 'server/utils/authorization';
import {sendPhaseItemNotActiveError, sendTeamAccessError} from 'server/utils/authorizationErrors';
import UpdateReflectionLocationPayload from 'server/graphql/types/UpdateReflectionLocationPayload';
import {sendPhaseItemNotFoundError, sendReflectionNotFoundError} from 'server/utils/docNotFoundErrors';
import {sendAlreadyCompletedMeetingPhaseError, sendAlreadyEndedMeetingError} from 'server/utils/alreadyMutatedErrors';
import publish from 'server/utils/publish';
import {REFLECT, TEAM} from 'universal/utils/constants';
import isPhaseComplete from 'universal/utils/meetings/isPhaseComplete';

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
    }
  },
  async resolve(source, {reflectionId, retroPhaseItemId, sortOrder}, {authToken, dataLoader, socketId: mutatorId}) {
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
    const phaseItem = await dataLoader.get('customPhaseItems').load(retroPhaseItemId);
    if (!phaseItem || phaseItem.teamId !== teamId) return sendPhaseItemNotFoundError(authToken, retroPhaseItemId);
    if (!phaseItem.isActive) return sendPhaseItemNotActiveError(authToken, retroPhaseItemId);

    // RESOLUTION
    await r.table('RetroReflection').get(reflectionId)
      .update({
        sortOrder,
        retroPhaseItemId,
        updatedAt: now
      });

    const data = {meetingId, reflectionId};
    publish(TEAM, teamId, UpdateReflectionLocationPayload, data, subOptions);
    return data;
  }
};

