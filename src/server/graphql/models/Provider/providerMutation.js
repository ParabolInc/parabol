//import getRethink from 'server/database/rethinkDriver';
import {
  GraphQLNonNull,
  GraphQLBoolean,
  GraphQLID,
  GraphQLString
} from 'graphql';
import {getUserId, requireSUOrTeamMember, requireWebsocket} from 'server/utils/authorization';
import queryIntegrator from 'server/utils/queryIntegrator';
import {handleRethinkRemove} from 'server/utils/makeChangefeedHandler';
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
    async resolve(source, {providerId, teamId}, {authToken, exchange, socket}) {

      // AUTH
      requireSUOrTeamMember(authToken, teamId);
      requireWebsocket(socket);
      // RESOLUTION

      const {data, errors} = await queryIntegrator({
        action: 'removeToken',
        payload: {
          providerId,
          teamId
        }
      });

      // TODO refactor projects to hold an id like github's full_name for repos
      //if (service === GITHUB) {
      //  await r.table('Project')
      //    .getAll(teamId, {index: 'teamId'})
      //    .filter({
      //      integrationId: 'foo'
      //    })
      //    .delete();
      //}

      if (errors) {
        throw errorObj({_error: errors[0]});
      }

      const oldTokenId = data.removeToken;
      if (oldTokenId) {
        const payload = handleRethinkRemove({id: oldTokenId});
        const userId = getUserId(authToken);
        const teamMemberId = `${userId}::${teamId}`;
        const channel = `providers/${teamMemberId}`;
        exchange.publish(channel, payload);
      }
    }
  }
};
