import getRethink from 'server/database/rethinkDriver';
import {
  GraphQLNonNull,
  GraphQLBoolean,
  GraphQLID
} from 'graphql';
import {requireSUOrTeamMember, requireWebsocket} from 'server/utils/authorization';

export default {
  type: GraphQLBoolean,
  description: 'Delete an action',
  args: {
    actionId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The actionId (teamId::shortid) to delete'
    }
  },
  async resolve(source, {actionId}, {authToken, socket}) {
    const r = getRethink();

    // AUTH
    const [teamId] = actionId.split('::');
    requireSUOrTeamMember(authToken, teamId);
    requireWebsocket(socket);

    // RESOLUTION
    await r.table('Action').get(actionId).delete();
  }
};
