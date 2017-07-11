import {GraphQLID, GraphQLNonNull} from 'graphql';
import makeSubscribeIter from 'server/graphql/makeSubscribeIter';
import {SlackIntegration} from 'server/graphql/models/SlackIntegration/slackIntegrationSchema';
import {requireSUOrTeamMember} from 'server/utils/authorization';

export default {
  type: SlackIntegration,
  args: {
    teamId: {
      type: new GraphQLNonNull(GraphQLID)
    }
  },
  subscribe: (source, {teamId}, {authToken, socketId}) => {
    // AUTH
    requireSUOrTeamMember(authToken, teamId);

    // RESOLUTION
    const channelName = `slackChannelAdded.${teamId}`;
    const filterFn = (value) => value.mutatorId !== socketId;
    return makeSubscribeIter(channelName, filterFn);
  }
};
