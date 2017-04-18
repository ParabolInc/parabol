import getRethink from 'server/database/rethinkDriver';
import {
  GraphQLNonNull,
  GraphQLBoolean,
  GraphQLID,
  GraphQLString
} from 'graphql';
import {requireSUOrSelf, requireSUOrTeamMember, requireWebsocket} from 'server/utils/authorization';
import queryIntegrator from 'server/utils/queryIntegrator';

export default {
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
    async resolve(source, {teamMemberId, service}, {authToken, socket}) {
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
        },
      });

      // TODO refactor projects to hold an id like github's full_name for repos
      await r.table('Project')
        .getAll(teamId, {index: 'teamId'})
        .filter({
          integrationId: 'foo'
        })
        .delete();
      return res.data;
    }
  }
};
