import getArchivedTasksConn from 'universal/mutations/connections/getArchivedTasksConn';
import getTeamTasksConn from 'universal/mutations/connections/getTeamTasksConn';
import getUserTasksConn from 'universal/mutations/connections/getUserTasksConn';
import pluralizeHandler from 'universal/mutations/handlers/pluralizeHandler';
import safeRemoveNodeFromConn from 'universal/utils/relay/safeRemoveNodeFromConn';
import safeRemoveNodeFromArray from 'universal/utils/relay/safeRemoveNodeFromArray';

const handleRemoveTask = (taskId, store, viewerId) => {
  const viewer = store.get(viewerId);
  const task = store.get(taskId);
  if (!task) return;
  const teamId = task.getValue('teamId');
  const reflectionGroupId = task.getValue('reflectionGroupId');
  const reflectionGroup = store.get(reflectionGroupId);
  const meetingId = task.getValue('meetingId');
  const meeting = store.get(meetingId);
  const archiveConn = getArchivedTasksConn(viewer, teamId);
  const teamConn = getTeamTasksConn(viewer, teamId);
  const userConn = getUserTasksConn(viewer);
  safeRemoveNodeFromConn(taskId, teamConn);
  safeRemoveNodeFromConn(taskId, userConn);
  safeRemoveNodeFromConn(taskId, archiveConn);
  safeRemoveNodeFromArray(taskId, reflectionGroup, 'tasks');
  safeRemoveNodeFromArray(taskId, meeting, 'tasks');
};

const handleRemoveTasks = pluralizeHandler(handleRemoveTask);
export default handleRemoveTasks;
