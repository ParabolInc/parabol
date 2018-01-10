import {commitMutation} from 'react-relay';
import handleRemoveNotifications from 'universal/mutations/handlers/handleRemoveNotifications';
import handleRemoveProjects from 'universal/mutations/handlers/handleRemoveProjects';
import getInProxy from 'universal/utils/relay/getInProxy';
import isTempId from 'universal/utils/relay/isTempId';

graphql`
  fragment DeleteProjectMutation_project on DeleteProjectPayload {
    project {
      id
    }
  }
`;

graphql`
  fragment DeleteProjectMutation_notification on DeleteProjectPayload {
    involvementNotification {
      id
    }
  }
`;

const mutation = graphql`
  mutation DeleteProjectMutation($projectId: ID!) {
    deleteProject(projectId: $projectId) {
      ...DeleteProjectMutation_notification @relay(mask: false)
      ...DeleteProjectMutation_project @relay(mask: false)
      
    }
  }
`;

export const deleteProjectProjectUpdater = (payload, store, viewerId) => {
  const projectId = getInProxy(payload, 'project', 'id');
  handleRemoveProjects(projectId, store, viewerId);
};

export const deleteProjectNotificationUpdater = (payload, store, viewerId) => {
  const notificationId = getInProxy(payload, 'involvementNotification', 'id');
  handleRemoveNotifications(notificationId, store, viewerId);
};

const DeleteProjectMutation = (environment, projectId, teamId, onError, onCompleted) => {
  if (isTempId(projectId)) return undefined;
  const {viewerId} = environment;
  return commitMutation(environment, {
    mutation,
    variables: {projectId},
    updater: (store) => {
      const payload = store.getRootField('deleteProject');
      deleteProjectNotificationUpdater(payload, store, viewerId);
      deleteProjectProjectUpdater(payload, store, viewerId);
    },
    optimisticUpdater: (store) => {
      handleRemoveProjects(projectId, store, viewerId);
    },
    onError,
    onCompleted
  });
};

export default DeleteProjectMutation;
