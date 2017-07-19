import getRethink from 'server/database/rethinkDriver';
import getPubSub from 'server/utils/getPubSub';
import {GITHUB} from 'universal/utils/constants';

const removeRepoGitHub = async (integrationId, githubGlobalId, teamId, mutatorId) => {
  const r = getRethink();
  await r.table(GITHUB).get(integrationId)
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