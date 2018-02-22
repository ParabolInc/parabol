import {GraphQLID, GraphQLNonNull} from 'graphql';
import getRethink from 'server/database/rethinkDriver';
import PromoteToTeamLeadPayload from 'server/graphql/types/PromoteToTeamLeadPayload';
import {getUserId, requireTeamLead} from 'server/utils/authorization';
import publish from 'server/utils/publish';
import {TEAM_MEMBER} from 'universal/utils/constants';
import fromTeamMemberId from 'universal/utils/relay/fromTeamMemberId';
import toTeamMemberId from 'universal/utils/relay/toTeamMemberId';

export default {
  type: PromoteToTeamLeadPayload,
  description: 'Promote another team member to be the leader',
  args: {
    teamMemberId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'the new team member that will be the leader'
    }
  },
  async resolve(source, {teamMemberId}, {authToken, dataLoader, socketId: mutatorId}) {
    const r = getRethink();
    const operationId = dataLoader.share();
    const subOptions = {mutatorId, operationId};

    // AUTH
    const myUserId = getUserId(authToken);
    const {teamId} = fromTeamMemberId(teamMemberId);
    const myTeamMemberId = toTeamMemberId(teamId, myUserId);
    await requireTeamLead(myTeamMemberId);

    // VALIDATION
    const promoteeOnTeam = await r.table('TeamMember').get(teamMemberId);
    if (!promoteeOnTeam || !promoteeOnTeam.isNotRemoved) {
      throw new Error(`Member ${teamMemberId} is not on the team`);
    }

    // RESOLUTION
    await r({
      teamLead: r.table('TeamMember')
        .get(myTeamMemberId)
        .update({
          isLead: false
        }),
      promotee: r.table('TeamMember')
        .get(teamMemberId)
        .update({
          isLead: true
        })
    });

    const data = {oldTeamLeadId: myTeamMemberId, newTeamLeadId: teamMemberId};
    publish(TEAM_MEMBER, teamId, PromoteToTeamLeadPayload, data, subOptions);
    return data;
  }
};
