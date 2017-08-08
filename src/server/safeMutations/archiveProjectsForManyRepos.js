import archiveProjectsByGitHubRepo from 'server/safeMutations/archiveProjectsByGitHubRepo';

const archiveProjectsForManyRepos = async (integrationChanges) => {
  return Promise.all(integrationChanges.map(({new_val: {isActive, teamId, nameWithOwner}}) => {
    if (!isActive) {
      return archiveProjectsByGitHubRepo(teamId, nameWithOwner);
    }
    return [];
  }));
};

export default archiveProjectsForManyRepos;
