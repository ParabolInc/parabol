import {GraphQLBoolean, GraphQLID, GraphQLNonNull} from 'graphql';
import getRethink from 'server/database/rethinkDriver';
import getInviterInfoAndTeamName from 'server/graphql/models/Invitation/inviteTeamMembers/getInviterInfoAndTeamName';
import sendTeamInvitations from 'server/safeMutations/sendTeamInvitations';
import {getUserId, requireSUOrTeamMember, requireWebsocket} from 'server/utils/authorization';
import publishNotifications from 'server/utils/publishNotifications';


export default {
  name: 'ResendTeamInvite',
  type: GraphQLBoolean,
  description: 'Resend an invitation',
  args: {
    inviteId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The id of the invitation'
    }
  },
  async resolve(source, {inviteId}, {authToken, socket}) {
    const r = getRethink();

    // AUTH
    const userId = getUserId(authToken);
    const invitation = await r.table('Invitation').get(inviteId);
    if (!invitation) throw new Error('Invitation not found!');

    const {email, fullName, orgId, teamId} = invitation;
    requireSUOrTeamMember(authToken, teamId);
    requireWebsocket(socket);


    // RESOLUTION
    const inviterInfoAndTeamName = await getInviterInfoAndTeamName(teamId, userId);
    const inviter = {
      ...inviterInfoAndTeamName,
      orgId,
      teamId
    };
    const invitees = [{email, fullName}];
    const notificationsToAdd = sendTeamInvitations(invitees, inviter, inviteId);
    publishNotifications({notificationsToAdd});
    return true;
  }
};
