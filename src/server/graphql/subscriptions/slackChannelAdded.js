import {GraphQLID, GraphQLNonNull} from 'graphql';
import makeSubscribeIter from 'server/graphql/makeSubscribeIter';
import {isTeamMember} from 'server/utils/authorization';
import AddSlackChannelPayload from 'server/graphql/types/AddSlackChannelPayload';
import {sendTeamAccessError} from 'server/utils/authorizationErrors';

export default {
  type: new GraphQLNonNull(AddSlackChannelPayload),
  args: {
    teamId: {
      type: new GraphQLNonNull(GraphQLID)
    }
  },
  subscribe: (source, {teamId}, {authToken, dataLoader, socketId}) => {
    // AUTH
    if (!isTeamMember(authToken, teamId)) return sendTeamAccessError(authToken, teamId);

    // RESOLUTION
    const channelName = `slackChannelAdded.${teamId}`;
    const filterFn = (value) => value.mutatorId !== socketId;
    return makeSubscribeIter(channelName, {filterFn, dataLoader});
  }
};
