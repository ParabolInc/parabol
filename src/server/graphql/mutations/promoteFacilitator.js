import {GraphQLBoolean, GraphQLID, GraphQLNonNull} from 'graphql';
import getRethink from 'server/database/rethinkDriver';
import {requireSUOrTeamMember} from 'server/utils/authorization';
import {fromGlobalId} from 'graphql-relay';

export default {
  type: GraphQLBoolean,
  description: 'Change a facilitator while the meeting is in progress',
  args: {
    facilitatorId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The facilitator global teamMemberId for this meeting'
    }
  },
  async resolve(source, {facilitatorId}, {authToken, sharedDataloader, operationId}) {
    const r = getRethink();

    // AUTH
    // facilitatorId is of format 'userId::teamId'
    const {id: dbId, type} = fromGlobalId(facilitatorId);

    if (type !== 'TeamMember') {
      throw new Error('Invalid Team Member Id');
    }

    const [, teamId] = dbId.split('::');
    requireSUOrTeamMember(authToken, teamId);


    // VALIDATION
    const dataloader = sharedDataloader.get(operationId);
    const facilitatorMembership = await dataloader.teamMembers.load(dbId);
    if (!facilitatorMembership || !facilitatorMembership.isNotRemoved) {
      throw new Error('facilitator is not active on that team');
    }

    // RESOLUTION
    await r.table('Team').get(teamId).update({
      activeFacilitator: dbId
    });
    return true;
  }
};
