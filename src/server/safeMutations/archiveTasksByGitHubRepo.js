import getRethink from 'server/database/rethinkDriver';
import archiveTasksForDB from 'server/safeMutations/archiveTasksForDB';

const archiveTasksByGitHubRepo = async (teamId, nameWithOwner) => {
  const r = getRethink();
  const tasksToArchive = await r.table('Task')
    .getAll(teamId, {index: 'teamId'})
    .filter((doc) => doc('integration')('nameWithOwner').eq(nameWithOwner));
  return archiveTasksForDB(tasksToArchive);
};

export default archiveTasksByGitHubRepo;
