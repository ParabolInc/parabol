import {commitMutation} from 'react-relay';
import handleRemoveNotifications from 'universal/mutations/handlers/handleRemoveNotifications';
import handleRemoveTasks from 'universal/mutations/handlers/handleRemoveTasks';
import getInProxy from 'universal/utils/relay/getInProxy';
import isTempId from 'universal/utils/relay/isTempId';

graphql`
  fragment DeleteTaskMutation_task on DeleteTaskPayload {
    task {
      id
    }
  }
`;

graphql`
  fragment DeleteTaskMutation_notification on DeleteTaskPayload {
    involvementNotification {
      id
    }
  }
`;

const mutation = graphql`
  mutation DeleteTaskMutation($taskId: ID!) {
    deleteTask(taskId: $taskId) {
      ...DeleteTaskMutation_notification @relay(mask: false)
      ...DeleteTaskMutation_task @relay(mask: false)
      
    }
  }
`;

export const deleteTaskTaskUpdater = (payload, store, viewerId) => {
  const taskId = getInProxy(payload, 'task', 'id');
  handleRemoveTasks(taskId, store, viewerId);
};

export const deleteTaskNotificationUpdater = (payload, store, viewerId) => {
  const notificationId = getInProxy(payload, 'involvementNotification', 'id');
  handleRemoveNotifications(notificationId, store, viewerId);
};

const DeleteTaskMutation = (environment, taskId, teamId, onError, onCompleted) => {
  if (isTempId(taskId)) return undefined;
  const {viewerId} = environment;
  return commitMutation(environment, {
    mutation,
    variables: {taskId},
    updater: (store) => {
      const payload = store.getRootField('deleteTask');
      deleteTaskNotificationUpdater(payload, store, viewerId);
      deleteTaskTaskUpdater(payload, store, viewerId);
    },
    optimisticUpdater: (store) => {
      handleRemoveTasks(taskId, store, viewerId);
    },
    onError,
    onCompleted
  });
};

export default DeleteTaskMutation;
