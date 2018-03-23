/**
 * Changes the editing state of a retrospective reflection.
 *
 * @flow
 */
import type {AuthToken} from 'universal/types/auth';

import {GraphQLID, GraphQLNonNull, GraphQLBoolean} from 'graphql';

import getRethink from 'server/database/rethinkDriver';
import UpdateRetroReflectionIsEditingPayload from 'server/graphql/types/UpdateReflectionIsEditingPayload';
import {isTeamMember} from 'server/utils/authorization';
import RethinkDataLoader from 'server/utils/RethinkDataLoader';
import publish from 'server/utils/publish';
import {TEAM} from 'universal/utils/constants';

type Args = {
  isEditing: boolean,
  reflectionId: string,
};

type Context = {
  authToken: AuthToken,
  dataLoader: RethinkDataLoader,
  socketId: string
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
    const now = new Date();
    const operationId = dataLoader.share();
    const subOptions = {operationId, mutatorId};

    // AUTH  / VALIDATION
    const reflection = await r.table('RetroReflection').get(reflectionId);
    if (!reflection) {
      throw new Error(`Reflection with id "${reflectionId}" does not exist.`);
    }
    const {meetingId} = reflection;
    const meeting = await dataLoader.get('newMeetings').load(meetingId);
    if (!meeting) {
      throw new Error(`Reflection "${reflectionId}" points to meeting "${meetingId}", which does not exist.`);
    }
    const {teamId} = meeting;
    if (!isTeamMember(authToken, teamId)) {
      throw new Error(`Unauthorized.  You do not have access to team "${teamId}".`);
    }

    // RESOLUTION
    await r
      .table('RetroReflection')
      .get(reflectionId)
      .update({
        isEditing,
        updatedAt: now
      });

    const data = {meetingId, reflectionId};
    publish(TEAM, teamId, UpdateRetroReflectionIsEditingPayload, data, subOptions);
    return data;
  }
};
