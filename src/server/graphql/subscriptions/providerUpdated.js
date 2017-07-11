import {GraphQLID, GraphQLNonNull} from 'graphql';
import makeSubscribeIter from 'server/graphql/makeSubscribeIter';
import {requireSUOrTeamMember} from 'server/utils/authorization';
import {RemoveProviderPayload} from 'server/graphql/mutations/removeProvider';

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
    const channelName = `providerUpdated.${teamId}`;
    const filterFn = (value) => value.mutatorId !== socketId;
    return makeSubscribeIter(channelName, filterFn);
  }
};
