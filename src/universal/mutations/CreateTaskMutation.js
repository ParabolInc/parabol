import {commitMutation} from 'react-relay';
import handleAddNotifications from 'universal/mutations/handlers/handleAddNotifications';
import handleEditTask from 'universal/mutations/handlers/handleEditTask';
import handleUpsertTasks from 'universal/mutations/handlers/handleUpsertTasks';
import popInvolvementToast from 'universal/mutations/toasts/popInvolvementToast';
import makeEmptyStr from 'universal/utils/draftjs/makeEmptyStr';
import clientTempId from 'universal/utils/relay/clientTempId';
import createProxyRecord from 'universal/utils/relay/createProxyRecord';
import getOptimisticTaskEditor from 'universal/utils/relay/getOptimisticTaskEditor';
import toTeamMemberId from 'universal/utils/relay/toTeamMemberId';


graphql`
  fragment CreateTaskMutation_task on CreateTaskPayload {
    task {
      ...CompleteTaskFrag @relay(mask: false)
    }
  }
`;

graphql`
  fragment CreateTaskMutation_notification on CreateTaskPayload {
    involvementNotification {
      id
      changeAuthor {
        preferredName
      }
      involvement
      team {
        id
        name
      }
      task {
        content
        status
        tags
        assignee {
          ...on TeamMember {
            picture
          }
          preferredName
        }
      }
    }
  }
`;

const mutation = graphql`
  mutation CreateTaskMutation($newTask: CreateTaskInput!, $area: AreaEnum) {
    createTask(newTask: $newTask, area: $area) {
      ...CreateTaskMutation_task @relay(mask: false)
    }
  }
`;

export const createTaskTaskUpdater = (payload, store, viewerId, isEditing) => {
  const task = payload.getLinkedRecord('task');
  if (!task) return;
  const taskId = task.getValue('id');
  const userId = task.getValue('userId');
  const editorPayload = getOptimisticTaskEditor(store, userId, taskId, isEditing);
  handleEditTask(editorPayload, store);
  handleUpsertTasks(task, store, viewerId);
};

export const createTaskNotificationUpdater = (payload, store, viewerId, options) => {
  const notification = payload.getLinkedRecord('involvementNotification');
  if (!notification) return;
  handleAddNotifications(notification, store, viewerId);

  // No need to pass options for the mutation because you can't notify yourself of your involvement
  if (options) {
    popInvolvementToast(notification, options);
  }
};

const CreateTaskMutation = (environment, newTask, area, onError, onCompleted) => {
  const {viewerId} = environment;
  const isEditing = !newTask.content;
  return commitMutation(environment, {
    mutation,
    variables: {
      area,
      newTask
    },
    updater: (store) => {
      const payload = store.getRootField('createTask');
      createTaskTaskUpdater(payload, store, viewerId, isEditing);
    },
    optimisticUpdater: (store) => {
      const {teamId, userId} = newTask;
      const assigneeId = toTeamMemberId(teamId, userId);
      const now = new Date().toJSON();
      const taskId = clientTempId(teamId);
      const optimisticTask = {
        ...newTask,
        id: taskId,
        teamId,
        userId,
        createdAt: now,
        createdBy: userId,
        updatedAt: now,
        tags: [],
        assigneeId,
        content: newTask.content || makeEmptyStr()
      };
      const task = createProxyRecord(store, 'Task', optimisticTask)
        .setLinkedRecord(store.get(assigneeId), 'assignee')
        .setLinkedRecord(store.get(teamId), 'team');
      const editorPayload = getOptimisticTaskEditor(store, userId, taskId, isEditing);
      handleEditTask(editorPayload, store);
      handleUpsertTasks(task, store, viewerId);
    },
    onError,
    onCompleted
  });
};

export default CreateTaskMutation;
