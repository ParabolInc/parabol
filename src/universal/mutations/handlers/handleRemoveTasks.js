import getArchivedTasksConn from 'universal/mutations/connections/getArchivedTasksConn';
import getTeamTasksConn from 'universal/mutations/connections/getTeamTasksConn';
import getUserTasksConn from 'universal/mutations/connections/getUserTasksConn';
import pluralizeHandler from 'universal/mutations/handlers/pluralizeHandler';
import safeRemoveNodeFromConn from 'universal/utils/relay/safeRemoveNodeFromConn';

const handleRemoveTask = (taskId, store, viewerId) => {
  const viewer = store.get(viewerId);
  const task = store.get(taskId);
  if (!task) return;
  const teamId = task.getValue('teamId');
  const archiveConn = getArchivedTasksConn(viewer, teamId);
  const teamConn = getTeamTasksConn(viewer, teamId);
  const userConn = getUserTasksConn(viewer);
  safeRemoveNodeFromConn(taskId, teamConn);
  safeRemoveNodeFromConn(taskId, userConn);
  safeRemoveNodeFromConn(taskId, archiveConn);
};

const handleRemoveTasks = pluralizeHandler(handleRemoveTask);
export default handleRemoveTasks;
