import getRethink from 'server/database/rethinkDriver';
import {
  GraphQLNonNull,
  GraphQLBoolean,
  GraphQLID,
  GraphQLString
} from 'graphql';
import {requireSUOrSelf, requireSUOrTeamMember, requireWebsocket} from 'server/utils/authorization';
import queryIntegrator from 'server/utils/queryIntegrator';
import addSlackChannel from './addSlackChannel/addSlackChannel';
import {GITHUB} from 'universal/utils/constants';
import {handleRethinkRemove} from 'server/utils/makeChangefeedHandler';

export default {
  addSlackChannel,
  removeIntegration: {
    type: GraphQLBoolean,
    description: 'Remove an integration from a team',
    args: {
      teamMemberId: {
        type: new GraphQLNonNull(GraphQLID),
        description: 'The id of the teamMember calling it.'
      },
      service: {
        type: new GraphQLNonNull(GraphQLString),
        description: 'the service to remove'
      }
    },
    async resolve(source, {teamMemberId, service}, {authToken, exchange, socket}) {
      const r = getRethink();

      // AUTH
      const [userId, teamId] = teamMemberId.split('::');
      requireSUOrSelf(authToken, userId);
      requireSUOrTeamMember(authToken, teamId);
      requireWebsocket(socket);
      // RESOLUTION
      // const channel = `integrations/${teamMemberId}`;
      const res = await queryIntegrator({
        action: 'removeToken',
        payload: {
          service,
          teamMemberId
        }
      });

      // TODO refactor projects to hold an id like github's full_name for repos
      if (service === GITHUB) {
        await r.table('Project')
          .getAll(teamId, {index: 'teamId'})
          .filter({
            integrationId: 'foo'
          })
          .delete();
      }
      const oldTokenId = res.data.removeToken;
      if (oldTokenId) {
        const payload = handleRethinkRemove({id: oldTokenId});
        const channel = `integrations/${teamMemberId}`;
        exchange.publish(channel, payload);
      }
    }
  }
};
