import {GraphQLBoolean, GraphQLID, GraphQLNonNull} from 'graphql';
import getRethink from 'server/database/rethinkDriver';
import {getUserId, requireSUOrTeamMember, requireWebsocket} from 'server/utils/authorization';
import getPubSub from 'server/utils/getPubSub';
import {FACILITATOR_REQUEST, USER_MEMO} from 'universal/subscriptions/constants';

export default {
  name: 'RequestFacilitator',
  description: 'Request to become the facilitator in a meeting',
  type: GraphQLBoolean,
  args: {
    teamId: {
      type: new GraphQLNonNull(GraphQLID)
    }
  },
  resolve: async (source, {teamId}, {authToken, socket}) => {
    const r = getRethink();

    // AUTH
    const userId = getUserId(authToken);
    requireSUOrTeamMember(authToken, teamId);
    requireWebsocket(socket);

    // VALIDATION
    const requestorId = `${userId}::${teamId}`;
    const team = await r.table('Team').get(teamId)
      .pluck('activeFacilitator')
      .merge({
        requestorName: r.table('TeamMember').get(requestorId)('preferredName')
      });
    const {activeFacilitator, requestorName} = team;
    if (activeFacilitator === requestorId) {
      // no UI for this
      throw new Error('You are already the facilitator');
    }

    // RESOLUTION
    const [currentFacilitatorUserId] = activeFacilitator.split('::');
    const userMemo = {
      requestorId,
      requestorName,
      type: FACILITATOR_REQUEST
    };

    getPubSub().publish(`${USER_MEMO}.${currentFacilitatorUserId}`, {userMemo});
    return true;
  }
};
