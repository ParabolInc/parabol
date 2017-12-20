import {GraphQLBoolean, GraphQLID, GraphQLNonNull} from 'graphql';
import getRethink from 'server/database/rethinkDriver';
import getInviterInfoAndTeamName from 'server/graphql/mutations/helpers/inviteTeamMembers/getInviterInfoAndTeamName';
import sendTeamInvitations from 'server/safeMutations/sendTeamInvitations';
import {getUserId, requireTeamMember} from 'server/utils/authorization';

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
  async resolve(source, {inviteId}, {authToken, dataLoader, socketId: mutatorId}) {
    const r = getRethink();
    const operationId = dataLoader.share();
    const subOptions = {mutatorId, operationId};
    // AUTH
    const userId = getUserId(authToken);
    const invitation = await r.table('Invitation').get(inviteId);
    if (!invitation) throw new Error('Invitation not found!');

    const {email, fullName, orgId, teamId} = invitation;
    requireTeamMember(authToken, teamId);


    // RESOLUTION
    const inviterInfoAndTeamName = await getInviterInfoAndTeamName(teamId, userId);
    const inviter = {
      ...inviterInfoAndTeamName,
      orgId,
      teamId
    };
    const invitees = [{email, fullName}];
    sendTeamInvitations(invitees, inviter, inviteId, subOptions);
    return true;
  }
};
