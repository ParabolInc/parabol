import {commitMutation} from 'react-relay';
import handleRemoveNotifications from 'universal/mutations/handlers/handleRemoveNotifications';
import handleRemoveProjects from 'universal/mutations/handlers/handleRemoveProjects';
import getInProxy from 'universal/utils/relay/getInProxy';
import isTempId from 'universal/utils/relay/isTempId';

const mutation = graphql`
  mutation DeleteProjectMutation($projectId: ID!) {
    deleteProject(projectId: $projectId) {
      project {
        id
      }
      removedInvolvementNotification {
        id
      }
    }
  }
`;

const DeleteProjectMutation = (environment, projectId, teamId, onError, onCompleted) => {
  if (isTempId(projectId)) return undefined;
  const {viewerId} = environment;
  return commitMutation(environment, {
    mutation,
    variables: {projectId},
    updater: (store) => {
      const payload = store.getRootField('deleteProject');
      const notificationId = getInProxy(payload, 'removedInvolvementNotification', 'id');
      handleRemoveNotifications(notificationId, store, viewerId);
      handleRemoveProjects(projectId, store, viewerId);
    },
    optimisticUpdater: (store) => {
      handleRemoveProjects(projectId, store, viewerId);
    },
    onError,
    onCompleted
  });
};

export default DeleteProjectMutation;
