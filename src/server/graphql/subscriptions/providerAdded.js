import {GraphQLID, GraphQLNonNull} from 'graphql';
import makeSubscribeIter from 'server/graphql/makeSubscribeIter';
import AddProviderPayload from 'server/graphql/types/AddProviderPayload';
import {requireSUOrTeamMember} from 'server/utils/authorization';


export default {
  type: AddProviderPayload,
  args: {
    teamId: {
      type: new GraphQLNonNull(GraphQLID)
    }
  },
  subscribe: (source, {teamId}, {authToken, socketId}) => {
    // AUTH
    requireSUOrTeamMember(authToken, teamId);

    // RESOLUTION
    const channelName = `providerAdded.${teamId}`;
    //const resolve = (value) => {
    //  // we know what the providerMap for slack will look like because everyone uses the same token
    //  if (value.provider.service === SLACK) {
    //    return value;
    //  }
    //  return undefined;
    //  // wait for GH to add this logic, it involves a per-user query
    //  //const userId = getUserId(authToken);
    //  //return providerMapResolution(userId, teamId)
    //}
    return makeSubscribeIter(channelName);
  }
};
