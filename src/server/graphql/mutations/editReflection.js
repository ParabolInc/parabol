/**
 * Changes the editing state of a retrospective reflection.
 *
 * @flow
 */
import type {Context} from 'server/flowtypes/graphql';
import {GraphQLBoolean, GraphQLID, GraphQLNonNull} from 'graphql';
import getRethink from 'server/database/rethinkDriver';
import EditReflectionPayload from 'server/graphql/types/EditReflectionPayload';
import {getUserId, isTeamMember} from 'server/utils/authorization';
import {sendReflectionAccessError, sendTeamAccessError} from 'server/utils/authorizationErrors';
import {sendMeetingNotFoundError, sendReflectionNotFoundError} from 'server/utils/docNotFoundErrors';
import publish from 'server/utils/publish';
import {GROUP, TEAM} from 'universal/utils/constants';
import {sendAlreadyCompletedMeetingPhaseError, sendAlreadyEndedMeetingError} from 'server/utils/alreadyMutatedErrors';
import isPhaseComplete from 'universal/utils/meetings/isPhaseComplete';

type Args = {
  isEditing: boolean,
  reflectionId: string,
};

export default {
  description: 'Changes the editing state of a retrospective reflection',
  type: EditReflectionPayload,
  args: {
    reflectionId: {
      type: new GraphQLNonNull(GraphQLID)
    },
    isEditing: {
      description: 'Whether this reflection is being edited or not',
      type: new GraphQLNonNull(GraphQLBoolean)
    }
  },
  async resolve(source: Object, {reflectionId, isEditing}: Args, {authToken, dataLoader, socketId: mutatorId}: Context) {
    const r = getRethink();
    const operationId = dataLoader.share();
    const subOptions = {operationId, mutatorId};

    // AUTH
    const viewerId = getUserId(authToken);
    const reflection = await r.table('RetroReflection').get(reflectionId);
    if (!reflection) return sendReflectionNotFoundError(authToken, reflectionId);
    const {creatorId, meetingId} = reflection;
    const meeting = await dataLoader.get('newMeetings').load(meetingId);
    const {endedAt, phases, teamId} = meeting;
    if (!isTeamMember(authToken, teamId)) return sendTeamAccessError(authToken, teamId);
    if (endedAt) return sendAlreadyEndedMeetingError(authToken, meetingId);
    if (isPhaseComplete(GROUP, phases)) return sendAlreadyCompletedMeetingPhaseError(authToken, GROUP);
    if (creatorId !== viewerId) return sendReflectionAccessError(authToken, reflectionId);
    if (!meeting) return sendMeetingNotFoundError(authToken, meetingId);

    // RESOLUTION
    const data = {meetingId, reflectionId, editorId: mutatorId, isEditing};
    publish(TEAM, teamId, EditReflectionPayload, data, subOptions);
    return data;
  }
};
