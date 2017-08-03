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
    // no need for a special resolve because we don't send secret info like accessToken
    // we send the userId of the person who removed the provider & the client decides how to update the map
    return makeSubscribeIter(channelName, filterFn);
  }
};
