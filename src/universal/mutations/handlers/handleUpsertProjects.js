import getArchivedProjectsConn from 'universal/mutations/connections/getArchivedProjectsConn';
import getTeamProjectsConn from 'universal/mutations/connections/getTeamProjectsConn';
import getUserProjectsConn from 'universal/mutations/connections/getUserProjectsConn';
import pluralizeHandler from 'universal/mutations/handlers/pluralizeHandler';
import getNodeById from 'universal/utils/relay/getNodeById';
import {insertEdgeAfter} from 'universal/utils/relay/insertEdge';
import safeRemoveNodeFromConn from 'universal/utils/relay/safeRemoveNodeFromConn';
import {ConnectionHandler} from 'relay-runtime';

const handleUpsertProject = (project, store, viewerId) => {
  if (!project) return;
  // we currently have 3 connections, user, team, and team archive
  const viewer = store.get(viewerId);
  const teamId = project.getValue('teamId');
  const projectId = project.getValue('id');
  const tags = project.getValue('tags');
  const isNowArchived = tags.includes('archived');
  const archiveConn = getArchivedProjectsConn(viewer, teamId);
  const teamConn = getTeamProjectsConn(viewer, teamId);
  const userConn = getUserProjectsConn(viewer);
  const safePutNodeInConn = (conn) => {
    if (conn && !getNodeById(projectId, conn)) {
      const newEdge = ConnectionHandler.createEdge(
        store,
        conn,
        project,
        'ProjectEdge'
      );
      newEdge.setValue(project.getValue('updatedAt'), 'cursor');
      insertEdgeAfter(conn, newEdge, 'updatedAt');
    }
  };

  if (isNowArchived) {
    safeRemoveNodeFromConn(projectId, teamConn);
    safeRemoveNodeFromConn(projectId, userConn);
    safePutNodeInConn(archiveConn);
  } else {
    safeRemoveNodeFromConn(projectId, archiveConn);
    safePutNodeInConn(teamConn);
    if (userConn) {
      const ownedByViewer = project.getValue('userId') === viewerId;
      if (ownedByViewer) {
        safePutNodeInConn(userConn);
      } else {
        safeRemoveNodeFromConn(projectId, userConn);
      }
    }
  }
};

const handleUpsertProjects = pluralizeHandler(handleUpsertProject);
export default handleUpsertProjects;
