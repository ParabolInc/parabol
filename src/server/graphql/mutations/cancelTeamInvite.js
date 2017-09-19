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
    const invitation = await r.table('Invitation').get(inviteId).default(null);
    const {email, teamId} = invitation;
    if (!teamId) {
      throw new Error('Invitation not found!');
    }
    requireSUOrTeamMember(authToken, teamId);
    requireWebsocket(socket);


    // RESOLUTION
    await r({
      invitation: r.table('Invitation').get(inviteId).update({
        // set expiration to epoch
        tokenExpiration: new Date(0),
        updatedAt: now
      }),
      orgApproval: r.table('OrgApproval')
        .getAll(email, {index: 'email'})
        .filter({teamId})
        .update({
          isActive: false
        })
    });
    return true;
  }
};
