import getRethink from 'server/database/rethinkDriver';
import {
  GraphQLNonNull,
  GraphQLBoolean,
  GraphQLID,
  GraphQLString
} from 'graphql';
import {requireSUOrSelf, requireSUOrTeamMember, requireWebsocket} from 'server/utils/authorization';
import Queue from 'server/utils/bull';

const integratorQueue = Queue('integrator');
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
      const channel = `integrations/${teamMemberId}`;
      integratorQueue.add({
        action: 'removeToken',
        channel,
        payload: {
          teamMemberId
        },
        service
      });

      // TODO refactor projects to hold an id like github's full_name for repos
      await r.table('Project')
        .getAll(teamId, {index: 'teamId'})
        .filter({
          integrationId: 'foo'
        })
        .delete();
      return true;
    }
  }
};
