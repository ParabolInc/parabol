import {GraphQLID, GraphQLNonNull} from 'graphql';
import makeSubscribeIter from 'server/graphql/makeSubscribeIter';
import {requireSUOrTeamMember} from 'server/utils/authorization';
import RemoveGitHubRepoPayload from 'server/graphql/types/RemoveGitHubRepoPayload';

export default {
  type: new GraphQLNonNull(RemoveGitHubRepoPayload),
  args: {
    teamId: {
      type: new GraphQLNonNull(GraphQLID)
    }
  },
  subscribe: (source, {teamId}, {authToken, socketId}) => {
    // AUTH
    requireSUOrTeamMember(authToken, teamId);

    // RESOLUTION
    const channelName = `githubRepoRemoved.${teamId}`;
    const filterFn = (value) => value.mutatorId !== socketId;
    return makeSubscribeIter(channelName, {filterFn});
  }
};
