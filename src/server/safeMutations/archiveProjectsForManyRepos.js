import archiveProjectsByGitHubRepo from 'server/safeMutations/archiveProjectsByGitHubRepo';

const archiveProjectsForManyRepos = async (integrationChanges, dataLoader) => {
  return Promise.all(integrationChanges.map((change) => {
    const {new_val: {isActive, teamId, nameWithOwner}} = change;
    if (!isActive) {
      return archiveProjectsByGitHubRepo(teamId, nameWithOwner, dataLoader);
    }
    return [];
  }));
};

export default archiveProjectsForManyRepos;
