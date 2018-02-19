import jwtDecode from 'jwt-decode';
import {commitMutation} from 'react-relay';
import {setWelcomeActivity} from 'universal/modules/userDashboard/ducks/settingsDuck';
import {acceptTeamInviteTeamUpdater} from 'universal/mutations/AcceptTeamInviteMutation';
import handleToastError from 'universal/mutations/handlers/handleToastError';
import {setAuthToken} from 'universal/redux/authDuck';
import handleUpsertTasks from 'universal/mutations/handlers/handleUpsertTasks';
import getTagsFromEntityMap from 'universal/utils/draftjs/getTagsFromEntityMap';
import updateProxyRecord from 'universal/utils/relay/updateProxyRecord';
import fromTeamMemberId from 'universal/utils/relay/fromTeamMemberId';
import handleRemoveTasks from 'universal/mutations/handlers/handleRemoveTasks';
import handleRemoveNotifications from 'universal/mutations/handlers/handleRemoveNotifications';
import getInProxy from 'universal/utils/relay/getInProxy';
import popInvolvementToast from 'universal/mutations/toasts/popInvolvementToast';
import handleAddNotifications from 'universal/mutations/handlers/handleAddNotifications';

graphql`
  fragment ChangeTaskTeamMutation_task on ChangeTaskTeamMutationPayload {
    task {
      ...CompleteTaskFrag @relay(mask: false)
    }
  }
`;

const mutation = graphql`
  mutation ChangeTaskTeamMutation($taskId: ID!, $teamId: ID!, $area: AreaEnum) {
    changeTaskTeam(taskId: $taskId, teamId: $teamId, area: $area) {
      ...ChangeTaskTeamMutation_task @relay(mask: false)
    }
  }
`;

export const changeTaskTeamTaskUpdater = (payload, store, viewerId, options) => {
  const task = payload.getLinkedRecord('task');
  handleUpsertTasks(task, store, viewerId);

  const addedNotification = payload.getLinkedRecord('addedNotification');
  handleAddNotifications(addedNotification, store, viewerId);
  if (options) {
    popInvolvementToast(addedNotification, options);
  }

  const removedNotificationId = getInProxy(payload, 'removedNotification', 'id');
  handleRemoveNotifications(removedNotificationId);

  const privatizedTaskId = payload.getValue('privatizedTaskId');
  const taskUserId = getInProxy(task, 'userId');
  if (taskUserId !== viewerId && privatizedTaskId) {
    handleRemoveTasks(privatizedTaskId, store, viewerId);
  }
};

const ChangeTaskTeamMutation = (environment, variables, onError, onCompleted) => {
  const {viewerId} = environment;
  return commitMutation(environment, {
    mutation,
    variables,
    updater: (store) => {
      const payload = store.getRootField('acceptTeamInviteEmail');
      acceptTeamInviteEmailTeamUpdater(payload, store, viewerId, dispatch);
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
    }
  });
};

export default ChangeTaskTeamMutation;
