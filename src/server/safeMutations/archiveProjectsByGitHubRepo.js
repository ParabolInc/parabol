import getRethink from 'server/database/rethinkDriver';
import archiveProjectsForDB from 'server/safeMutations/archiveProjectsForDB';

const archiveProjectsByGitHubRepo = async (teamId, nameWithOwner, dataLoader) => {
  const r = getRethink();
  const projectsToArchive = await r.table('Project')
    .getAll(teamId, {index: 'teamId'})
    .filter((doc) => doc('integration')('nameWithOwner').eq(nameWithOwner));
  const archivedProjects = archiveProjectsForDB(projectsToArchive, dataLoader);
  return archivedProjects.map(({id}) => id);
};

export default archiveProjectsByGitHubRepo;
