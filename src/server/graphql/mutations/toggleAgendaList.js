import {GraphQLID, GraphQLNonNull} from 'graphql';
import getRethink from 'server/database/rethinkDriver';
import TeamMember from 'server/graphql/types/TeamMember';
import {getUserId, requireTeamMember} from 'server/utils/authorization';

export default {
  type: TeamMember,
  description: 'Show/hide the agenda list',
  args: {
    teamId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'the team to hide the agenda for'
    }
  },
  async resolve(source, {teamId}, {authToken}) {
    const r = getRethink();

    // AUTH
    await requireTeamMember(authToken, teamId);

    // RESOLUTION
    const userId = getUserId(authToken);
    const myTeamMemberId = `${userId}::${teamId}`;
    return r.table('TeamMember')
      .get(myTeamMemberId)
      .update((teamMember) => ({
        hideAgenda: teamMember('hideAgenda').default(false).not()
      }), {returnChanges: true})('changes')(0)('new_val');
  }
};
