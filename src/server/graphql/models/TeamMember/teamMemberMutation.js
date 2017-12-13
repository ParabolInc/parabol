import {GraphQLBoolean, GraphQLID, GraphQLNonNull} from 'graphql';
import getRethink from 'server/database/rethinkDriver';
import {getUserId, requireTeamLead, requireWebsocket} from 'server/utils/authorization';
import {errorObj} from 'server/utils/utils';
import toTeamMemberId from 'universal/utils/relay/toTeamMemberId';

export default {
  promoteToLead: {
    type: GraphQLBoolean,
    description: 'Promote another team member to be the leader',
    args: {
      teamMemberId: {
        type: new GraphQLNonNull(GraphQLID),
        description: 'the new team member that will be the leader'
      }
    },
    async resolve(source, {teamMemberId}, {authToken, socket}) {
      const r = getRethink();

      // AUTH
      requireWebsocket(socket);
      const myUserId = getUserId(authToken);
      const [, teamId] = teamMemberId.split('::');
      const myTeamMemberId = toTeamMemberId(teamId, myUserId);
      await requireTeamLead(myTeamMemberId);

      // VALIDATION
      const promoteeOnTeam = await r.table('TeamMember').get(teamMemberId);
      if (!promoteeOnTeam || !promoteeOnTeam.isNotRemoved) {
        throw errorObj({_error: `Member ${teamMemberId} is not on the team`});
      }

      // RESOLUTION
      await r.table('TeamMember')
      // remove leadership from the caller
        .get(myTeamMemberId)
        .update({
          isLead: false
        })
        // give leadership to the new person
        .do(() => {
          return r.table('TeamMember')
            .get(teamMemberId)
            .update({
              isLead: true
            });
        });
      return true;
    }
  }
};
