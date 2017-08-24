import archiveProjectsByGitHubRepo from 'server/safeMutations/archiveProjectsByGitHubRepo';

const archiveProjectsForManyRepos = async (integrationChanges) => {
  return Promise.all(integrationChanges.map((change) => {
    const {new_val: {isActive, teamId, nameWithOwner}} = change;
    if (!isActive) {
      return archiveProjectsByGitHubRepo(teamId, nameWithOwner);
    }
    return [];
  }));
};

export default archiveProjectsForManyRepos;
