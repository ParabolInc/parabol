import {GraphQLID, GraphQLNonNull} from 'graphql';
import {fromGlobalId} from 'graphql-relay';
import getRethink from 'server/database/rethinkDriver';
import RemoveGitHubRepoPayload from 'server/graphql/types/RemoveGitHubRepoPayload';
import {getIsTeamLead, getUserId, requireTeamMember, requireWebsocket} from 'server/utils/authorization';
import getPubSub from 'server/utils/getPubSub';
import {GITHUB} from 'universal/utils/constants';
import archiveProjectsByGitHubRepo from 'server/safeMutations/archiveProjectsByGitHubRepo';


export default {
  name: 'RemoveGitHubRepo',
  description: 'Remove a github repo integration from a team',
  type: new GraphQLNonNull(RemoveGitHubRepoPayload),
  args: {
    githubGlobalId: {
      type: new GraphQLNonNull(GraphQLID)
    }
  },
  resolve: async (source, {githubGlobalId}, {authToken, socket, dataLoader}) => {
    const r = getRethink();
    const {id} = fromGlobalId(githubGlobalId);

    // AUTH
    const userId = getUserId(authToken);
    const integration = await r.table(GITHUB).get(id);
    if (!integration) {
      // no UI for this
      throw new Error(`${githubGlobalId} does not exist`);
    }
    const {teamId, isActive, userIds, nameWithOwner} = integration;
    requireTeamMember(authToken, teamId);
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
    await r.table(GITHUB).get(id)
      .update({
        isActive: false,
        userIds: []
      });

    const archivedProjectIds = await archiveProjectsByGitHubRepo(teamId, nameWithOwner, dataLoader);
    const githubRepoRemoved = {
      deletedId: githubGlobalId,
      archivedProjectIds
    };
    getPubSub().publish(`githubRepoRemoved.${teamId}`, {githubRepoRemoved, mutatorId: socket.id});
    return githubRepoRemoved;
  }
};
