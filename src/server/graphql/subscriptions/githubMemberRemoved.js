import {GraphQLID, GraphQLNonNull} from 'graphql';
import makeSubscribeIter from 'server/graphql/makeSubscribeIter';
import GitHubMemberRemovedPayload from 'server/graphql/types/GitHubMemberRemovedPayload';
import {requireSUOrTeamMember} from 'server/utils/authorization';

export default {
  type: new GraphQLNonNull(GitHubMemberRemovedPayload),
  args: {
    teamId: {
      type: new GraphQLNonNull(GraphQLID)
    }
  },
  subscribe: (source, {teamId}, {authToken, getDataLoader}) => {
    // AUTH
    requireSUOrTeamMember(authToken, teamId);

    // RESOLUTION
    const channelName = `githubMemberRemoved.${teamId}`;
    return makeSubscribeIter(channelName, {getDataLoader});
  }
};
