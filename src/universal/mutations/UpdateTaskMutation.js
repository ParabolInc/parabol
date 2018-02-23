import {commitMutation} from 'react-relay';
import handleAddNotifications from 'universal/mutations/handlers/handleAddNotifications';
import handleRemoveNotifications from 'universal/mutations/handlers/handleRemoveNotifications';
import handleUpsertTasks from 'universal/mutations/handlers/handleUpsertTasks';
import popInvolvementToast from 'universal/mutations/toasts/popInvolvementToast';
import getTagsFromEntityMap from 'universal/utils/draftjs/getTagsFromEntityMap';
import getInProxy from 'universal/utils/relay/getInProxy';
import updateProxyRecord from 'universal/utils/relay/updateProxyRecord';
import handleRemoveTasks from 'universal/mutations/handlers/handleRemoveTasks';
import fromTeamMemberId from 'universal/utils/relay/fromTeamMemberId';

graphql`
  fragment UpdateTaskMutation_task on UpdateTaskPayload {
    task {
      # Entire frag needed in case it is deprivatized
      ...CompleteTaskFrag @relay(mask:false)
      editors {
        userId
        preferredName
      }
    }
    addedNotification {
      type
      ...TaskInvolves_notification @relay(mask: false)
    }
    removedNotification {
      id
    }
    privatizedTaskId
  }
`;

const mutation = graphql`
  mutation UpdateTaskMutation($updatedTask: UpdateTaskInput!) {
    updateTask(updatedTask: $updatedTask) {
      ...UpdateTaskMutation_task @relay (mask: false)
    }
  }
`;

export const updateTaskTaskUpdater = (payload, store, viewerId, options) => {
  const task = payload.getLinkedRecord('task');
  handleUpsertTasks(task, store, viewerId);

  const addedNotification = payload.getLinkedRecord('addedNotification');
  handleAddNotifications(addedNotification, store, viewerId);
  if (options) {
    popInvolvementToast(addedNotification, options);
  }

  const removedNotificationId = getInProxy(payload, 'removedNotification', 'id');
  handleRemoveNotifications(removedNotificationId, store, viewerId);

  const privatizedTaskId = payload.getValue('privatizedTaskId');
  const taskUserId = getInProxy(task, 'userId');
  if (taskUserId !== viewerId && privatizedTaskId) {
    handleRemoveTasks(privatizedTaskId, store, viewerId);
  }
};

const UpdateTaskMutation = (environment, updatedTask, area, onCompleted, onError) => {
  const {viewerId} = environment;
  return commitMutation(environment, {
    mutation,
    variables: {
      area,
      updatedTask
    },
    updater: (store) => {
      const payload = store.getRootField('updateTask');
      updateTaskTaskUpdater(payload, store, viewerId);
    },
    optimisticUpdater: (store) => {
      const {id, content, assigneeId} = updatedTask;
      const task = store.get(id);
      if (!task) return;
      const now = new Date();
      const optimisticTask = {
        ...updatedTask,
        updatedAt: now.toJSON()
      };
      updateProxyRecord(task, optimisticTask);
      if (assigneeId) {
        task.setValue(assigneeId, 'assigneeId');
        const assignee = store.get(assigneeId);
        if (assignee) {
          task.setLinkedRecord(assignee, 'assignee');
          if (assignee.getValue('__typename') === 'TeamMember') {
            const {userId} = fromTeamMemberId(assigneeId);
            task.setValue(userId, 'userId');
          }
        }
      }
      if (content) {
        const {entityMap} = JSON.parse(content);
        const nextTags = getTagsFromEntityMap(entityMap);
        task.setValue(nextTags, 'tags');
      }
      handleUpsertTasks(task, store, viewerId);
    },
    onCompleted,
    onError
  });
};

export default UpdateTaskMutation;
