import getArchivedProjectsConn from 'universal/mutations/connections/getArchivedProjectsConn';
import getTeamProjectsConn from 'universal/mutations/connections/getTeamProjectsConn';
import getUserProjectsConn from 'universal/mutations/connections/getUserProjectsConn';
import pluralizeHandler from 'universal/mutations/handlers/pluralizeHandler';
import safeRemoveNodeFromConn from 'universal/utils/relay/safeRemoveNodeFromConn';

const handleRemoveProject = (projectId, store, viewerId) => {
  const viewer = store.get(viewerId);
  const project = store.get(projectId);
  if (!project) return;
  const teamId = project.getValue('teamId');
  const archiveConn = getArchivedProjectsConn(viewer, teamId);
  const teamConn = getTeamProjectsConn(viewer, teamId);
  const userConn = getUserProjectsConn(viewer);
  safeRemoveNodeFromConn(projectId, teamConn);
  safeRemoveNodeFromConn(projectId, userConn);
  safeRemoveNodeFromConn(projectId, archiveConn);
};

const handleRemoveProjects = pluralizeHandler(handleRemoveProject);
export default handleRemoveProjects;
