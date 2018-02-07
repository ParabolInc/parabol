import getRethink from 'server/database/rethinkDriver';
import archiveTasksForDB from 'server/safeMutations/archiveTasksForDB';

const archiveTasksByGitHubRepo = async (teamId, nameWithOwner, dataLoader) => {
  const r = getRethink();
  const tasksToArchive = await r.table('Task')
    .getAll(teamId, {index: 'teamId'})
    .filter((doc) => doc('integration')('nameWithOwner').eq(nameWithOwner));
  const archivedTasks = archiveTasksForDB(tasksToArchive, dataLoader);
  return archivedTasks.map(({id}) => id);
};

export default archiveTasksByGitHubRepo;
