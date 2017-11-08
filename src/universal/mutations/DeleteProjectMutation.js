import {commitMutation} from 'react-relay';
import {
  getArchiveConnection,
  getTeamDashConnection,
  getUserDashConnection
} from 'universal/mutations/UpdateProjectMutation';
import safeRemoveNodeFromConn from 'universal/utils/relay/safeRemoveNodeFromConn';

const mutation = graphql`
  mutation DeleteProjectMutation($projectId: ID!) {
    deleteProject(projectId: $projectId) {
      project {
        id
      }
    }
  }
`;

const removeFromProjectConnections = (store, viewerId, projectId, teamId) => {
  // we currently have 3 connections, user, team, and team archive
  const viewer = store.get(viewerId);
  const archiveConn = getArchiveConnection(viewer, teamId);
  const teamConn = getTeamDashConnection(viewer, teamId);
  const userConn = getUserDashConnection(viewer);
  safeRemoveNodeFromConn(projectId, teamConn);
  safeRemoveNodeFromConn(projectId, userConn);
  safeRemoveNodeFromConn(projectId, archiveConn);
};

const DeleteProjectMutation = (environment, projectId, teamId, onError, onCompleted) => {
  const {viewerId} = environment;
  const updater = (store) => {
    removeFromProjectConnections(store, viewerId, projectId, teamId);
  };
  return commitMutation(environment, {
    mutation,
    variables: {projectId},
    updater,
    optimisticUpdater: updater,
    onError,
    onCompleted
  });
};

export default DeleteProjectMutation;
