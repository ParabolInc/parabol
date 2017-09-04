import {GraphQLBoolean, GraphQLID, GraphQLNonNull} from 'graphql';
import getRethink from 'server/database/rethinkDriver';
import {requireSUOrTeamMember} from 'server/utils/authorization';

export default {
  type: GraphQLBoolean,
  description: 'Change a facilitator while the meeting is in progress',
  args: {
    facilitatorId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The facilitator teamMemberId for this meeting'
    }
  },
  async resolve(source, {facilitatorId}, {authToken}) {
    const r = getRethink();

    // AUTH
    // facilitatorId is of format 'userId::teamId'
    const [, teamId] = facilitatorId.split('::');
    requireSUOrTeamMember(authToken, teamId);


    // VALIDATION
    const facilitatorMembership = await r.table('TeamMember').get(facilitatorId);
    if (!facilitatorMembership || !facilitatorMembership.isNotRemoved) {
      throw new Error('facilitator is not active on that team');
    }

    // RESOLUTION
    await r.table('Team').get(teamId).update({
      activeFacilitator: facilitatorId
    });
    return true;
  }
};
