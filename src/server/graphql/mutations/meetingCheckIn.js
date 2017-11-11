import {GraphQLBoolean, GraphQLID, GraphQLNonNull} from 'graphql';
import getRethink from 'server/database/rethinkDriver';
import {requireSUOrTeamMember} from 'server/utils/authorization';
import UpdateTeamMemberPayload from 'server/graphql/types/UpdateTeamMemberPayload';
import getPubSub from 'server/utils/getPubSub';
import {fromGlobalId} from 'graphql-relay';
import {TEAM_MEMBER_UPDATED} from 'universal/utils/constants';

export default {
  type: UpdateTeamMemberPayload,
  description: 'Check a member in as present or absent',
  args: {
    teamMemberId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The global teamMemberId of the person who is being checked in'
    },
    isCheckedIn: {
      type: GraphQLBoolean,
      description: 'true if the member is present, false if absent, null if undecided'
    }
  },
  async resolve(source, {teamMemberId, isCheckedIn}, {authToken, operationId, sharedDataloader, socketId}) {
    const r = getRethink();
    sharedDataloader.share(operationId);

    // AUTH
    const {id: dbId, type} = fromGlobalId(teamMemberId);
    if (type !== 'TeamMember') {
      throw new Error('Invalid Team Member Id');
    }

    // teamMemberId is of format 'userId::teamId'
    const [, teamId] = dbId.split('::');
    requireSUOrTeamMember(authToken, teamId);

    // RESOLUTION
    const teamMember = await r.table('TeamMember')
      .get(dbId)
      .update({isCheckedIn}, {returnChanges: true})('changes')(0)('new_val');

    const teamMemberUpdated = {teamMember};
    getPubSub().publish(`${TEAM_MEMBER_UPDATED}.${teamId}`, {teamMemberUpdated, mutatorId: socketId, operationId});
    return teamMemberUpdated;
  }
};