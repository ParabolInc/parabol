import {GraphQLBoolean, GraphQLID, GraphQLNonNull} from 'graphql';
import removeAllTeamMembers from 'server/graphql/models/TeamMember/removeTeamMember/removeAllTeamMembers';
import {getUserId, requireTeamLead} from 'server/utils/authorization';
import fromTeamMemberId from 'universal/utils/relay/fromTeamMemberId';
import toTeamMemberId from 'universal/utils/relay/toTeamMemberId';

export default {
  type: GraphQLBoolean,
  description: 'Remove a team member from the team',
  args: {
    teamMemberId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The teamMemberId of the person who is being removed'
    }
  },
  async resolve(source, {teamMemberId}, {authToken}) {
    // AUTH
    const myUserId = getUserId(authToken);
    const {userId, teamId} = fromTeamMemberId(teamMemberId);
    const isSelf = myUserId === userId;
    if (!isSelf) {
      const myTeamMemberId = toTeamMemberId(teamId, myUserId);
      await requireTeamLead(myTeamMemberId);
    }
    // RESOLUTION
    await removeAllTeamMembers(teamMemberId, {isKickout: !isSelf});
    return true;
  }
};
