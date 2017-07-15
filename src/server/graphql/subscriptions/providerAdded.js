import {GraphQLID, GraphQLNonNull} from 'graphql';
import makeSubscribeIter from 'server/graphql/makeSubscribeIter';
import AddProviderPayload from 'server/graphql/types/AddProviderPayload';
import {getUserId, requireSUOrTeamMember} from 'server/utils/authorization';
import {SLACK} from 'universal/utils/constants';


export default {
  type: new GraphQLNonNull(AddProviderPayload),
  args: {
    teamId: {
      type: new GraphQLNonNull(GraphQLID)
    }
  },
  subscribe: (source, {teamId}, {authToken}) => {
    // AUTH
    requireSUOrTeamMember(authToken, teamId);
    const subscriberUserId = getUserId(authToken);

    // RESOLUTION
    const channelName = `providerAdded.${teamId}`;
    const resolve = (value) => {
      const {providerAdded: {provider: {service, userId}}} = value;
      // we know what the providerMap for slack will look like because everyone uses the same token
      if (service === SLACK || subscriberUserId === userId) {
        return value;
      } else {
        // TODO we'll use this when we add in user count && integration count
        // wait for GH to add this logic, it involves a per-user query
        //const userId = getUserId(authToken);
        //return providerMapResolution(userId, teamId)
      }
      return undefined;
    }
    return makeSubscribeIter(channelName);
  }
};
