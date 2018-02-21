import {commitMutation} from 'react-relay';
import handleUpsertTasks from 'universal/mutations/handlers/handleUpsertTasks';
import updateProxyRecord from 'universal/utils/relay/updateProxyRecord';
import handleRemoveNotifications from 'universal/mutations/handlers/handleRemoveNotifications';
import getInProxy from 'universal/utils/relay/getInProxy';
import safeRemoveNodeFromUnknownConn from 'universal/utils/relay/safeRemoveNodeFromUnknownConn';

graphql`
  fragment ChangeTaskTeamMutation_task on ChangeTaskTeamPayload {
    task {
      ...CompleteTaskFrag @relay(mask: false)
    }
    removedNotification {
      id
    }
    removedTaskId
  }
`;

const mutation = graphql`
  mutation ChangeTaskTeamMutation($taskId: ID!, $teamId: ID!, $area: AreaEnum) {
    changeTaskTeam(taskId: $taskId, teamId: $teamId, area: $area) {
      ...ChangeTaskTeamMutation_task @relay(mask: false)
    }
  }
`;

export const changeTaskTeamTaskUpdater = (payload, store, viewerId) => {
  const task = payload.getLinkedRecord('task');
  const taskId = getInProxy(task, 'id') || payload.getValue('removedTaskId');
  safeRemoveNodeFromUnknownConn(store, viewerId, 'TeamColumnsContainer_tasks', taskId);
  handleUpsertTasks(task, store, viewerId);

  const removedNotificationId = getInProxy(payload, 'removedNotification', 'id');
  handleRemoveNotifications(removedNotificationId);
};

const ChangeTaskTeamMutation = (environment, variables, onError, onCompleted) => {
  const {viewerId} = environment;
  return commitMutation(environment, {
    mutation,
    variables,
    updater: (store) => {
      const payload = store.getRootField('changeTaskTeam');
      changeTaskTeamTaskUpdater(payload, store, viewerId);
    },
    optimisticUpdater: (store) => {
      const {taskId, teamId} = variables;
      const task = store.get(taskId);
      if (!taskId) return;
      const now = new Date();
      const optimisticTask = {
        updatedAt: now.toJSON()
      };
      updateProxyRecord(task, optimisticTask);
      task.setValue(teamId, 'teamId');
      const team = store.get(teamId);
      if (team) {
        task.setLinkedRecord(team, 'team');
      }
      handleUpsertTasks(task, store, viewerId);
    },
    onError,
    onCompleted
  });
};

export default ChangeTaskTeamMutation;
