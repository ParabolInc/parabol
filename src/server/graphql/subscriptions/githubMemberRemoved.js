import {GraphQLID, GraphQLNonNull} from 'graphql';
import makeSubscribeIter from 'server/graphql/makeSubscribeIter';
import GitHubMemberRemovedPayload from 'server/graphql/types/GitHubMemberRemovedPayload';
import {isTeamMember} from 'server/utils/authorization';
import {sendTeamAccessError} from 'server/utils/authorizationErrors';

export default {
  type: new GraphQLNonNull(GitHubMemberRemovedPayload),
  args: {
    teamId: {
      type: new GraphQLNonNull(GraphQLID)
    }
  },
  subscribe: (source, {teamId}, {authToken, dataLoader}) => {
    // AUTH
    if (!isTeamMember(authToken, teamId)) {
      return sendTeamAccessError(authToken, teamId);
    }

    // RESOLUTION
    const channelName = `githubMemberRemoved.${teamId}`;
    return makeSubscribeIter(channelName, {dataLoader});
  }
};
