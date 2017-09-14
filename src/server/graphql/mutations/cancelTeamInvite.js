import {GraphQLBoolean, GraphQLID, GraphQLNonNull} from 'graphql';
import getRethink from 'server/database/rethinkDriver';
import {requireSUOrTeamMember, requireWebsocket} from 'server/utils/authorization';


export default {
  name: 'CancelTeamInvite',
  type: GraphQLBoolean,
  description: 'Cancel an invitation',
  args: {
    inviteId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The id of the invitation'
    }
  },
  async resolve(source, {inviteId}, {authToken, socket}) {
    const r = getRethink();
    const now = new Date();

    // AUTH
    const teamId = await r.table('Invitation').get(inviteId)('teamId').default(null);
    if (!teamId) {
      throw new Error('Invitation not found!');
    }
    requireSUOrTeamMember(authToken, teamId);
    requireWebsocket(socket);


    // RESOLUTION
    await r.table('Invitation').get(inviteId).update({
      // set expiration to epoch
      tokenExpiration: new Date(0),
      updatedAt: now
    });
    return true;
  }
};
