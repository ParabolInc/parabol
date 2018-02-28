import {createTaskTaskUpdater} from 'universal/mutations/CreateTaskMutation';
import {deleteTaskTaskUpdater} from 'universal/mutations/DeleteTaskMutation';
import {editTaskTaskUpdater} from 'universal/mutations/EditTaskMutation';
import {removeTeamMemberTasksUpdater} from 'universal/mutations/RemoveTeamMemberMutation';
import {updateTaskTaskUpdater} from 'universal/mutations/UpdateTaskMutation';
import {endMeetingTaskUpdater} from 'universal/mutations/EndMeetingMutation';
import {removeOrgUserTaskUpdater} from 'universal/mutations/RemoveOrgUserMutation';
import {cancelApprovalTaskUpdater} from 'universal/mutations/CancelApprovalMutation';
import {rejectOrgApprovalTaskUpdater} from 'universal/mutations/RejectOrgApprovalMutation';
import {cancelTeamInviteTaskUpdater} from 'universal/mutations/CancelTeamInviteMutation';
import {inviteTeamMembersTaskUpdater} from 'universal/mutations/InviteTeamMembersMutation';
import {acceptTeamInviteTaskUpdater} from 'universal/mutations/AcceptTeamInviteMutation';
import {changeTaskTeamTaskUpdater} from 'universal/mutations/ChangeTaskTeamMutation';

const subscription = graphql`
  subscription TaskSubscription {
    taskSubscription {
      __typename
      ...AcceptTeamInviteMutation_task
      ...AcceptTeamInviteEmailMutation_task
      ...RemoveTeamMemberMutation_task
      ...CancelApprovalMutation_task
      ...CancelTeamInviteMutation_task
      ...ChangeTaskTeamMutation_task
      ...CreateGitHubIssueMutation_task
      ...CreateTaskMutation_task
      ...DeleteTaskMutation_task
      ...EditTaskMutation_task
      ...EndMeetingMutation_task
      ...InviteTeamMembersMutation_task
      ...RejectOrgApprovalMutation_task
      ...RemoveOrgUserMutation_task
      ...UpdateTaskMutation_task
    }
  }
`;

const TaskSubscription = (environment, queryVariables, {dispatch, history, location}) => {
  const {viewerId} = environment;
  return {
    subscription,
    variables: {},
    updater: (store) => {
      const payload = store.getRootField('taskSubscription');
      const type = payload.getValue('__typename');
      switch (type) {
        case 'AcceptTeamInviteNotificationPayload':
        case 'AcceptTeamInviteEmailPayload':
          acceptTeamInviteTaskUpdater(payload, store, viewerId);
          break;
        case 'RemoveTeamMemberOtherPayload':
          removeTeamMemberTasksUpdater(payload, store, viewerId);
          break;
        case 'CancelApprovalPayload':
          cancelApprovalTaskUpdater(payload, store, viewerId);
          break;
        case 'CancelTeamInvitePayload':
          cancelTeamInviteTaskUpdater(payload, store, viewerId);
          break;
        case 'ChangeTaskTeamPayload':
          changeTaskTeamTaskUpdater(payload, store, viewerId);
          break;
        case 'CreateTaskPayload':
          createTaskTaskUpdater(payload, store, viewerId, false);
          break;
        case 'DeleteTaskPayload':
          deleteTaskTaskUpdater(payload, store, viewerId);
          break;
        case 'EditTaskPayload':
          editTaskTaskUpdater(payload, store);
          break;
        case 'EndMeetingPayload':
          endMeetingTaskUpdater(payload, store, viewerId);
          break;
        case 'InviteTeamMembersPayload':
          inviteTeamMembersTaskUpdater(payload, store, viewerId);
          break;
        case 'RejectOrgApprovalPayload':
          rejectOrgApprovalTaskUpdater(payload, store, viewerId);
          break;
        case 'RemoveOrgUserPayload':
          removeOrgUserTaskUpdater(payload, store, viewerId);
          break;
        case 'UpdateTaskPayload':
          updateTaskTaskUpdater(payload, store, viewerId, {dispatch, history, location});
          break;
        default:
          console.error('TeamSubscription case fail', type);
      }
    }
  };
};

export default TaskSubscription;
