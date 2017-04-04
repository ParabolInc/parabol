import {GraphQLNonNull, GraphQLID, GraphQLList} from 'graphql';
import {requireSUOrSelf, requireSUOrTeamMember} from 'server/utils/authorization';
import {Integration} from './integrationSchema';
import Queue from 'bull';

const integratorSubQueue = Queue('integratorSub');
export default {
  integrations: {
    type: new GraphQLList(Integration),
    args: {
      teamMemberId: {
        type: new GraphQLNonNull(GraphQLID),
        description: 'The unique teamMember ID'
      }
    },
    async resolve(source, {teamMemberId}, {authToken, socket}) {
      // AUTH
      const [userId, teamId] = teamMemberId.split('::');
      requireSUOrSelf(authToken, userId);
      requireSUOrTeamMember(authToken, teamId);

      // RESOLUTION
      integratorSubQueue.add({
        channel: `integrations/${teamMemberId}`,
        socketId: socket.id,
        sub: 'getIntegrations',
        variables: {
          teamMemberId
        }
      });
    }
  }
};
