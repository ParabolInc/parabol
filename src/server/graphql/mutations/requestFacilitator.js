import {GraphQLBoolean, GraphQLID, GraphQLNonNull} from 'graphql';
import {getUserId, requireTeamMember} from 'server/utils/authorization';
import getPubSub from 'server/utils/getPubSub';
import {FACILITATOR_REQUEST, NOTIFICATIONS_ADDED} from 'universal/utils/constants';

export default {
  name: 'RequestFacilitator',
  description: 'Request to become the facilitator in a meeting',
  type: GraphQLBoolean,
  args: {
    teamId: {
      type: new GraphQLNonNull(GraphQLID)
    }
  },
  resolve: async (source, {teamId}, {authToken, dataLoader}) => {
    const operationId = dataLoader.share();

    // AUTH
    const userId = getUserId(authToken);
    requireTeamMember(authToken, teamId);

    // VALIDATION
    const requestorId = `${userId}::${teamId}`;
    const {activeFacilitator} = await dataLoader.get('teams').load(teamId);
    if (activeFacilitator === requestorId) {
      // no UI for this
      throw new Error('You are already the facilitator');
    }

    // RESOLUTION
    const [currentFacilitatorUserId] = activeFacilitator.split('::');
    const notificationsAdded = {
      notifications: [{
        requestorId,
        type: FACILITATOR_REQUEST
      }]
    };

    getPubSub().publish(`${NOTIFICATIONS_ADDED}.${currentFacilitatorUserId}`, {notificationsAdded, operationId});
    return true;
  }
};
