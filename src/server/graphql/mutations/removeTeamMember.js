import {
  GraphQLNonNull,
  GraphQLID,
  GraphQLBoolean
} from 'graphql';
import {
  requireSUOrSelfOrLead
} from 'server/utils/authorization';
import removeAllTeamMembers from 'server/graphql/models/TeamMember/removeTeamMember/removeAllTeamMembers';

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
    const [userId, teamId] = teamMemberId.split('::');
    await requireSUOrSelfOrLead(authToken, userId, teamId);
    const isKickout = authToken.sub !== userId;
    // RESOLUTION
    await removeAllTeamMembers(teamMemberId, {isKickout});
    return true;
  }
};
