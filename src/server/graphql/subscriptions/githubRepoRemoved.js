import {GraphQLID, GraphQLNonNull} from 'graphql';
import makeSubscribeIter from 'server/graphql/makeSubscribeIter';
import {requireTeamMember} from 'server/utils/authorization';
import RemoveGitHubRepoPayload from 'server/graphql/types/RemoveGitHubRepoPayload';

export default {
  type: new GraphQLNonNull(RemoveGitHubRepoPayload),
  args: {
    teamId: {
      type: new GraphQLNonNull(GraphQLID)
    }
  },
  subscribe: (source, {teamId}, {authToken, dataLoader, socketId}) => {
    // AUTH
    requireTeamMember(authToken, teamId);

    // RESOLUTION
    const channelName = `githubRepoRemoved.${teamId}`;
    const filterFn = (value) => value.mutatorId !== socketId;
    return makeSubscribeIter(channelName, {filterFn, dataLoader});
  }
};
