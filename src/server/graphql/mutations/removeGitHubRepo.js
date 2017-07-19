import {GraphQLID, GraphQLNonNull} from 'graphql';
import {fromGlobalId} from 'graphql-relay';
import getRethink from 'server/database/rethinkDriver';
import RemoveGitHubRepoPayload from 'server/graphql/types/RemoveGitHubRepoPayload';
import {getIsTeamLead, getUserId, requireSUOrTeamMember, requireWebsocket} from 'server/utils/authorization';
import getPubSub from 'server/utils/getPubSub';
import removeRepoGitHub from 'server/safeMutations/removeRepoGitHub';

export default {
  name: 'RemoveGitHubRepo',
  description: 'Remove a github repo integration from a team',
  type: new GraphQLNonNull(RemoveGitHubRepoPayload),
  args: {
    githubGlobalId: {
      type: new GraphQLNonNull(GraphQLID)
    }
  },
  resolve: async (source, {githubGlobalId}, {authToken, socket}) => {
    const r = getRethink();
    const {id} = fromGlobalId(githubGlobalId);

    // AUTH
    const userId = getUserId(authToken);
    const integration = await r.table('GitHubIntegration').get(id);
    if (!integration) {
      // no UI for this
      throw new Error(`${githubGlobalId} does not exist`);
    }
    const {teamId, isActive, userIds} = integration;
    requireSUOrTeamMember(authToken, teamId);
    requireWebsocket(socket);

    // VALIDATION
    if (!isActive) {
      // no UI for this
      throw new Error(`${githubGlobalId} has already been removed`);
    }

    if (!userIds.includes(userId)) {
      const isTeamLead = await getIsTeamLead(`${userId}::${teamId}`);
      if (!isTeamLead) {
        throw new Error('You must be part of the integration or the team lead to remove this');
      }
    }

    // RESOLUTION
    return removeRepoGitHub(id, githubGlobalId, teamId, socket.id);
  }
};
