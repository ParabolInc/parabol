import archiveTasksByGitHubRepo from 'server/safeMutations/archiveTasksByGitHubRepo';

const archiveTasksForManyRepos = async (integrationChanges) => {
  return Promise.all(integrationChanges.map((change) => {
    const {new_val: {isActive, teamId, nameWithOwner}} = change;
    if (!isActive) {
      return archiveTasksByGitHubRepo(teamId, nameWithOwner);
    }
    return [];
  }));
};

export default archiveTasksForManyRepos;
