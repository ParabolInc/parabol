import {GraphQLID, GraphQLList, GraphQLNonNull} from 'graphql';
import Invitee from 'server/graphql/types/Invitee';
import InviteTeamMembersPayload from 'server/graphql/types/InviteTeamMembersPayload';
import {getUserId, requireOrgLeaderOrTeamMember} from 'server/utils/authorization';
import inviteTeamMembers from 'server/safeMutations/inviteTeamMembers';
import getPubSub from 'server/utils/getPubSub';
import {ADDED, REJOIN_TEAM, TEAM_MEMBER} from 'universal/utils/constants';


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
  async resolve(source, {invitees, teamId}, {authToken, dataLoader, socketId: mutatorId}) {
    const operationId = dataLoader.share();
    // AUTH
    await requireOrgLeaderOrTeamMember(authToken, teamId);
    const userId = getUserId(authToken);

    // RESOLUTION
    const subOptions = {mutatorId, operationId};
    const {reactivations, results} = await inviteTeamMembers(invitees, teamId, userId, subOptions);
    const reactivatedTeamMemberIds = reactivations.map(({teamMemberId}) => teamMemberId);

    // HANDLE REACTIVATION
    // send a team + persisted notification to the reactivated team member

    // send a team member + temporary toast to the rest of the users
    reactivations.forEach(({teamMemberId, preferredName}) => {
      const notification = {type: REJOIN_TEAM, teamId, preferredName};
      getPubSub().publish(`${TEAM_MEMBER}.${teamId}`, {data: {teamMemberId, notification, type: ADDED}, ...subOptions});
    });

    //
    return {reactivatedTeamMemberIds, results};
  }
};

