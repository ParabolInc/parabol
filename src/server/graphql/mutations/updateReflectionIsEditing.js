/**
 * Changes the editing state of a retrospective reflection.
 *
 * @flow
 */
import type {Context} from 'universal/types/graphql';

import {GraphQLID, GraphQLNonNull, GraphQLBoolean} from 'graphql';

import getRethink from 'server/database/rethinkDriver';
import UpdateRetroReflectionIsEditingPayload from 'server/graphql/types/UpdateReflectionIsEditingPayload';
import {isTeamMember} from 'server/utils/authorization';
import {sendTeamAccessError} from 'server/utils/authorizationErrors';
import {sendMeetingNotFoundError, sendReflectionNotFoundError} from 'server/utils/docNotFoundErrors';
import publish from 'server/utils/publish';
import {TEAM} from 'universal/utils/constants';

type Args = {
  isEditing: boolean,
  reflectionId: string,
};

export default {
  description: 'Changes the editing state of a retrospective reflection',
  type: UpdateRetroReflectionIsEditingPayload,
  args: {
    reflectionId: {
      type: new GraphQLNonNull(GraphQLID)
    },
    isEditing: {
      description: 'Whether this reflection is being edited or not',
      type: new GraphQLNonNull(GraphQLBoolean)
    }
  },
  async resolve(
    source: Object,
    {reflectionId, isEditing}: Args,
    {authToken, dataLoader, socketId: mutatorId}: Context
  ) {
    const r = getRethink();
    const operationId = dataLoader.share();
    const subOptions = {operationId, mutatorId};

    // AUTH  / VALIDATION
    const reflection = await r.table('RetroReflection').get(reflectionId);
    if (!reflection) {
      return sendReflectionNotFoundError(authToken, reflectionId);
    }
    const {meetingId} = reflection;
    const meeting = await dataLoader.get('newMeetings').load(meetingId);
    if (!meeting) {
      return sendMeetingNotFoundError(authToken, meetingId);
    }
    const {teamId} = meeting;
    if (!isTeamMember(authToken, teamId)) {
      return sendTeamAccessError(authToken, teamId);
    }

    // RESOLUTION
    const data = {meetingId, reflection: {id: reflectionId, isEditing}};
    publish(TEAM, teamId, UpdateRetroReflectionIsEditingPayload, data, subOptions);
    return data;
  }
};
