import getArchivedTasksConn from 'universal/mutations/connections/getArchivedTasksConn';
import getTeamTasksConn from 'universal/mutations/connections/getTeamTasksConn';
import getUserTasksConn from 'universal/mutations/connections/getUserTasksConn';
import pluralizeHandler from 'universal/mutations/handlers/pluralizeHandler';
import getNodeById from 'universal/utils/relay/getNodeById';
import {insertEdgeAfter} from 'universal/utils/relay/insertEdge';
import safeRemoveNodeFromConn from 'universal/utils/relay/safeRemoveNodeFromConn';
import {ConnectionHandler} from 'relay-runtime';

const handleUpsertTask = (task, store, viewerId) => {
  if (!task) return;
  // we currently have 3 connections, user, team, and team archive
  const viewer = store.get(viewerId);
  const teamId = task.getValue('teamId');
  const taskId = task.getValue('id');
  const tags = task.getValue('tags');
  const isNowArchived = tags.includes('archived');
  const archiveConn = getArchivedTasksConn(viewer, teamId);
  const teamConn = getTeamTasksConn(viewer, teamId);
  const userConn = getUserTasksConn(viewer);
  const safePutNodeInConn = (conn) => {
    if (conn && !getNodeById(taskId, conn)) {
      const newEdge = ConnectionHandler.createEdge(
        store,
        conn,
        task,
        'TaskEdge'
      );
      newEdge.setValue(task.getValue('updatedAt'), 'cursor');
      insertEdgeAfter(conn, newEdge, 'updatedAt');
    }
  };

  if (isNowArchived) {
    safeRemoveNodeFromConn(taskId, teamConn);
    safeRemoveNodeFromConn(taskId, userConn);
    safePutNodeInConn(archiveConn);
  } else {
    safeRemoveNodeFromConn(taskId, archiveConn);
    safePutNodeInConn(teamConn);
    if (userConn) {
      const ownedByViewer = task.getValue('userId') === viewerId;
      if (ownedByViewer) {
        safePutNodeInConn(userConn);
      } else {
        safeRemoveNodeFromConn(taskId, userConn);
      }
    }
  }
};

const handleUpsertTasks = pluralizeHandler(handleUpsertTask);
export default handleUpsertTasks;
