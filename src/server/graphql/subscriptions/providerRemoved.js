import {GraphQLID, GraphQLNonNull} from 'graphql';
import makeSubscribeIter from 'server/graphql/makeSubscribeIter';
import RemoveProviderPayload from 'server/graphql/types/RemoveProviderPayload';
import {requireSUOrTeamMember} from 'server/utils/authorization';

export default {
  type: new GraphQLNonNull(RemoveProviderPayload),
  args: {
    teamId: {
      type: new GraphQLNonNull(GraphQLID)
    }
  },
  subscribe: (source, {teamId}, {authToken, socketId}) => {
    // AUTH
    requireSUOrTeamMember(authToken, teamId);

    // RESOLUTION
    const channelName = `providerRemoved.${teamId}`;
    const filterFn = (value) => {
      return value.mutatorId !== socketId;
    };
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
    return makeSubscribeIter(channelName, filterFn);
  }
};
