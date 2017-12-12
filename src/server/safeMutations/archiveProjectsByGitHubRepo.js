import getRethink from 'server/database/rethinkDriver';
import archiveProjectsForDB from 'server/safeMutations/archiveProjectsForDB';

const archiveProjectsByGitHubRepo = async (teamId, nameWithOwner) => {
  const r = getRethink();
  const projectsToArchive = await r.table('Project')
    .getAll(teamId, {index: 'teamId'})
    .filter((doc) => doc('integration')('nameWithOwner').eq(nameWithOwner));
  const archivedProjects = archiveProjectsForDB(projectsToArchive);
  return archivedProjects.map(({id}) => id);
};

export default archiveProjectsByGitHubRepo;
