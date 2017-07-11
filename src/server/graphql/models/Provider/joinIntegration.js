import {GraphQLBoolean, GraphQLID, GraphQLNonNull, GraphQLString} from 'graphql';
import getRethink from 'server/database/rethinkDriver';
import {requireSUOrSelf, requireSUOrTeamMember, requireWebsocket} from 'server/utils/authorization';
import serviceToProvider from 'server/utils/serviceToProvider';
import {errorObj} from 'server/utils/utils';

// Will use this when GH comes
export default {
  type: GraphQLBoolean,
  description: 'Remove a user from an integration',
  args: {
    teamMemberId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The id of the teamMember calling it.'
    },
    integrationId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'the id of the integration to remove'
    },
    service: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The name of the service like slack or github'
    }
  },
  async resolve(source, {teamMemberId, integrationId, service}, {authToken, socket}) {
    const r = getRethink();

    // AUTH
    const [userId, teamId] = teamMemberId.split('::');
    requireSUOrSelf(authToken, userId);
    requireSUOrTeamMember(authToken, teamId);
    requireWebsocket(socket);

    // RESOLUTION
    const table = serviceToProvider[service];
    const change = await r.table(table).get(integrationId)
      .update((doc) => ({
        blackList: doc('blackList').difference([userId]).default([]),
        userIds: doc('userIds').append(userId).distinct()
      }), {returnChanges: true})('changes')(0);

    if (!change) {
      throw errorObj({_error: `${integrationId} does not exist for ${service}`});
    }

    if (change.new_val.userIds.length === change.old_val.userIds.length) {
      throw errorObj({_error: `${userId} is already on the integration ${integrationId}`});
    }

    return true;
  }
};

