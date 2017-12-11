import {GraphQLID, GraphQLList, GraphQLNonNull} from 'graphql';
import Invitee from 'server/graphql/types/Invitee';
import InviteTeamMembersPayload from 'server/graphql/types/InviteTeamMembersPayload';
import {getUserId, requireOrgLeaderOrTeamMember} from 'server/utils/authorization';
import inviteTeamMembers from 'server/safeMutations/inviteTeamMembers';

export default {
  type: new GraphQLNonNull(InviteTeamMembersPayload),
  description: `If in the org,
     Send invitation emails to a list of email addresses, add them to the invitation table.
     Else, send a request to the org leader to get them approval and put them in the OrgApproval table.`,
  args: {
    teamId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The id of the inviting team'
    },
    invitees: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(Invitee)))
    }
  },
  async resolve(source, {invitees, teamId}, {authToken, dataLoader, socketId}) {
    // AUTH
    await requireOrgLeaderOrTeamMember(authToken, teamId);
    const userId = getUserId(authToken);

    // RESOLUTION
    return inviteTeamMembers(invitees, teamId, userId, dataLoader, socketId);
  }
};

