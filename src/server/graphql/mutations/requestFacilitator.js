import {GraphQLBoolean, GraphQLID, GraphQLNonNull} from 'graphql';
import {toGlobalId} from 'graphql-relay';
import {getUserId, requireSUOrTeamMember} from 'server/utils/authorization';
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
  resolve: async (source, {teamId}, {authToken, getDataLoader}) => {
    const dataLoader = getDataLoader();
    const operationId = dataLoader.id();
    dataLoader.share();

    // AUTH
    const userId = getUserId(authToken);
    requireSUOrTeamMember(authToken, teamId);

    // VALIDATION
    const dbRequestorId = `${userId}::${teamId}`;
    const {activeFacilitator} = await dataLoader.teams.load(teamId);
    if (activeFacilitator === dbRequestorId) {
      // no UI for this
      throw new Error('You are already the facilitator');
    }

    // RESOLUTION
    const requestorId = toGlobalId('TeamMember', dbRequestorId);
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
