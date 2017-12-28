import {GraphQLID, GraphQLNonNull} from 'graphql';
import getRethink from 'server/database/rethinkDriver';
import UpdateTeamMemberPayload from 'server/graphql/types/UpdateTeamMemberPayload';
import {getUserId, requireTeamLead} from 'server/utils/authorization';
import getPubSub from 'server/utils/getPubSub';
import {errorObj} from 'server/utils/utils';
import {TEAM_MEMBER, UPDATED} from 'universal/utils/constants';
import fromTeamMemberId from 'universal/utils/relay/fromTeamMemberId';
import toTeamMemberId from 'universal/utils/relay/toTeamMemberId';

export default {
  type: UpdateTeamMemberPayload,
  description: 'Promote another team member to be the leader',
  args: {
    teamMemberId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'the new team member that will be the leader'
    }
  },
  async resolve(source, {teamMemberId}, {authToken, dataLoader, socketId: mutatorId}) {
    const r = getRethink();

    // AUTH
    const myUserId = getUserId(authToken);
    const {teamId} = fromTeamMemberId(teamMemberId);
    const myTeamMemberId = toTeamMemberId(teamId, myUserId);
    await requireTeamLead(myTeamMemberId);

    // VALIDATION
    const promoteeOnTeam = await r.table('TeamMember').get(teamMemberId);
    if (!promoteeOnTeam || !promoteeOnTeam.isNotRemoved) {
      throw errorObj({_error: `Member ${teamMemberId} is not on the team`});
    }

    // RESOLUTION
    const {promotee, teamLead} = await r({
      teamLead: r.table('TeamMember')
        .get(myTeamMemberId)
        .update({
          isLead: false
        }, {returnChanges: true})('changes')(0)('new_val').default(null),
      promotee: r.table('TeamMember')
        .get(teamMemberId)
        .update({
          isLead: true
        }, {returnChanges: true})('changes')(0)('new_val').default(null)
    });

    if (!promotee || !teamLead) {
      throw new Error('Could not promote');
    }
    const operationId = dataLoader.share();
    const teamMemberUpdated = {teamMember: promotee};
    getPubSub().publish(`${TEAM_MEMBER}.${teamId}`, {teamMember: {teamMemberId: myTeamMemberId, type: UPDATED}, operationId, mutatorId });
    getPubSub().publish(`${TEAM_MEMBER}.${teamId}`, {teamMember: {teamMemberId, type: UPDATED}, operationId, mutatorId});
    return teamMemberUpdated;
  }
};
