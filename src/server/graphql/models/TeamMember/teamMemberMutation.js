import {GraphQLBoolean, GraphQLID, GraphQLNonNull} from 'graphql';
import getRethink from 'server/database/rethinkDriver';
import {requireSUOrLead, requireSUOrTeamMember, requireWebsocket} from 'server/utils/authorization';
import {errorObj} from 'server/utils/utils';

export default {
  checkIn: {
    type: GraphQLBoolean,
    description: 'Check a member in as present or absent',
    args: {
      teamMemberId: {
        type: new GraphQLNonNull(GraphQLID),
        description: 'The teamMemberId of the person who is being checked in'
      },
      isCheckedIn: {
        type: GraphQLBoolean,
        description: 'true if the member is present, false if absent, null if undecided'
      }
    },
    async resolve(source, {teamMemberId, isCheckedIn}, {authToken, socket}) {
      const r = getRethink();

      // AUTH
      // teamMemberId is of format 'userId::teamId'
      const [, teamId] = teamMemberId.split('::');
      requireSUOrTeamMember(authToken, teamId);
      requireWebsocket(socket);

      // RESOLUTION
      await r.table('TeamMember').get(teamMemberId).update({isCheckedIn});
    }
  },
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
      const [, teamId] = teamMemberId.split('::');
      const myTeamMemberId = `${authToken.sub}::${teamId}`;
      await requireSUOrLead(authToken, myTeamMemberId);

      // VALIDATION
      const promoteeOnTeam = await r.table('TeamMember').get(teamMemberId);
      if (!promoteeOnTeam) {
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
  },
  toggleAgendaList: {
    type: GraphQLBoolean,
    description: 'Show/hide the agenda list',
    args: {
      teamId: {
        type: new GraphQLNonNull(GraphQLID),
        description: 'the new team member that will be the leader'
      }
    },
    async resolve(source, {teamId}, {authToken, socket}) {
      const r = getRethink();

      // AUTH
      requireWebsocket(socket);
      const myTeamMemberId = `${authToken.sub}::${teamId}`;
      await requireSUOrTeamMember(authToken, teamId);

      // RESOLUTION
      await r.table('TeamMember')
        .get(myTeamMemberId)
        .update((teamMember) => ({
          hideAgenda: teamMember('hideAgenda').default(false).not()
        }));
      return true;
    }
  }
};
