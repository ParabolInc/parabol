import {GraphQLBoolean, GraphQLID, GraphQLNonNull, GraphQLString} from 'graphql';
import getRethink from 'server/database/rethinkDriver';
import {getUserId, requireSUOrTeamMember, requireWebsocket} from 'server/utils/authorization';
import serviceToProvider from 'server/utils/serviceToProvider';
import {errorObj} from 'server/utils/utils';

export default {
  removeProvider: {
    type: GraphQLBoolean,
    description: 'Disconnect a team from a Provider token',
    args: {
      providerId: {
        type: new GraphQLNonNull(GraphQLID),
        description: 'The id of the provider to remove'
      },
      teamId: {
        type: new GraphQLNonNull(GraphQLString),
        description: 'the teamId to disconnect from the token'
      }
    },
    async resolve(source, {providerId, teamId}, {authToken, socket}) {
      const r = getRethink();

      // AUTH
      requireSUOrTeamMember(authToken, teamId);
      requireWebsocket(socket);

      // RESOLUTION

      // unlink the team from the user's token
      const res = await r.table('Provider')
        .get(providerId)
        .update((user) => ({teamIds: user('teamIds').difference([teamId])}), {returnChanges: true});

      if (res.skipped === 1) {
        throw errorObj({_error: `Provider ${providerId} does not exist`});
      }

      // remove the user from every integration under the provider
      const affectedServices = res.changes[0];
      if (!affectedServices) return true;
      const {service} = affectedServices.new_val;
      const userId = getUserId(authToken);
      const table = serviceToProvider[service];
      const integrationChanges = await r.table(table)
        .getAll(userId, {index: 'userIds'})
        .update((user) => ({userIds: user('userIds').difference([userId])}), {returnChanges: true})('changes');
      if (integrationChanges.length === 0) return true;

      // remove the integration entirely if they were the last one on it
      const promises = integrationChanges.map((integration) => {
        const {id, userIds} = integration.new_val;
        if (userIds.length === 0) {
          return r.table(table).get(id)
            .update({
              isActive: false,
              userIds: []
            });
        }
        return undefined;
      });
      await Promise.all(promises);
      return true;

    }
  }
};
