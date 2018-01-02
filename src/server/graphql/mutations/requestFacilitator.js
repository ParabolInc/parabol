import {GraphQLBoolean, GraphQLID, GraphQLNonNull} from 'graphql';
import {getUserId, requireTeamMember} from 'server/utils/authorization';
import publish from 'server/utils/publish';
import {ADDED, FACILITATOR_REQUEST, NOTIFICATION} from 'universal/utils/constants';
import toTeamMemberId from 'universal/utils/relay/toTeamMemberId';

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
    const viewerId = getUserId(authToken);
    requireTeamMember(authToken, teamId);

    // VALIDATION
    const requestorId = toTeamMemberId(teamId, viewerId);
    const {activeFacilitator} = await dataLoader.get('teams').load(teamId);
    if (activeFacilitator === requestorId) {
      throw new Error('You are already the facilitator');
    }

    // RESOLUTION
    const [currentFacilitatorUserId] = activeFacilitator.split('::');
    const notification = {
      requestorId,
      type: FACILITATOR_REQUEST
    };

    publish(NOTIFICATION, currentFacilitatorUserId, ADDED, {notification}, {operationId});
    return true;
  }
};
