import getRethink from 'server/database/rethinkDriver';
import getPubSub from 'server/utils/getPubSub';

const removeRepoGitHub = async (integrationId, githubGlobalId, teamId, mutatorId) => {
  const r = getRethink();
  await r.table('GitHubIntegration').get(integrationId)
    .update({
      isActive: false,
      userIds: []
    });
  // TODO remove all the GH cards, too
  const githubRepoRemoved = {
    deletedId: githubGlobalId
  };
  getPubSub().publish(`githubRepoRemoved.${teamId}`, {githubRepoRemoved, mutatorId});
  return githubRepoRemoved;
};

export default removeRepoGitHub;