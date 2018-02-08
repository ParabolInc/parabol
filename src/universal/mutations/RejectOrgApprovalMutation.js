import {commitMutation} from 'react-relay';
import {showInfo} from 'universal/modules/toast/ducks/toastDuck';
import handleAddNotifications from 'universal/mutations/handlers/handleAddNotifications';
import handleRemoveNotifications from 'universal/mutations/handlers/handleRemoveNotifications';
import handleRemoveOrgApprovals from 'universal/mutations/handlers/handleRemoveOrgApprovals';
import getInProxy from 'universal/utils/relay/getInProxy';
import handleRemoveSoftTeamMembers from 'universal/mutations/handlers/handleRemoveSoftTeamMembers';
import handleUpsertTasks from 'universal/mutations/handlers/handleUpsertTasks';

graphql`
  fragment RejectOrgApprovalMutation_orgApproval on RejectOrgApprovalPayload {
    removedOrgApprovals {
      id
      teamId
    }
  }
`;

graphql`
  fragment RejectOrgApprovalMutation_notification on RejectOrgApprovalPayload {
    deniedNotifications {
      type
      ...DenyNewUser_notification @relay(mask: false)
    }
    removedRequestNotifications {
      id
    }
  }
`;

graphql`
  fragment RejectOrgApprovalMutation_teamMember on RejectOrgApprovalPayload {
    removedSoftTeamMembers {
      id
      teamId
    }
  }
`;

graphql`
  fragment RejectOrgApprovalMutation_task on RejectOrgApprovalPayload {
    archivedSoftTasks {
      ...CompleteTaskFrag @relay(mask: false)
    }
  }
`;
const mutation = graphql`
  mutation RejectOrgApprovalMutation($notificationId: ID!, $reason: String!) {
    rejectOrgApproval(notificationId: $notificationId, reason: $reason) {
      ...RejectOrgApprovalMutation_orgApproval @relay(mask: false)
      ...RejectOrgApprovalMutation_notification @relay(mask: false)
    }
  }
`;

const popDeniedOrgApprovalToast = (payload, {dispatch, history}) => {
  const notifications = payload.getLinkedRecords('deniedNotifications');
  const inviteeEmails = getInProxy(notifications, 'inviteeEmail');
  if (!inviteeEmails || inviteeEmails.length === 0) return;
  const [email] = inviteeEmails;
  dispatch(showInfo({
    autoDismiss: 10,
    title: 'Oh no!',
    message: `${email} was denied to join the team.`,
    action: {
      label: 'Find out why',
      callback: () => {
        history.push('/me/notifications');
      }
    }
  }));
};

export const rejectOrgApprovalOrgApprovalUpdater = (payload, store) => {
  const removedOrgApprovals = payload.getLinkedRecords('removedOrgApprovals');
  handleRemoveOrgApprovals(removedOrgApprovals, store);
};

export const rejectOrgApprovalNotificationUpdater = (payload, store, viewerId, options) => {
  const removedRequestNotifications = payload.getLinkedRecords('removedRequestNotifications');
  const notificationIds = getInProxy(removedRequestNotifications, 'id');
  handleRemoveNotifications(notificationIds, store, viewerId);

  const deniedNotifications = payload.getLinkedRecords('deniedNotifications');
  handleAddNotifications(deniedNotifications, store, viewerId);
  if (options) {
    popDeniedOrgApprovalToast(payload, options);
  }
};

export const rejectOrgApprovalTeamMemberUpdater = (payload, store) => {
  const removedSoftTeamMembers = payload.getLinkedRecords('removedSoftTeamMembers');
  handleRemoveSoftTeamMembers(removedSoftTeamMembers, store);
};

export const rejectOrgApprovalTaskUpdater = (payload, store, viewerId) => {
  const archivedSoftTasks = payload.getLinkedRecords('archivedSoftTasks');
  handleUpsertTasks(archivedSoftTasks, store, viewerId);
};

const RejectOrgApprovalMutation = (environment, variables, onError, onCompleted) => {
  const {viewerId} = environment;
  return commitMutation(environment, {
    mutation,
    variables,
    updater: (store) => {
      const payload = store.getRootField('rejectOrgApproval');
      rejectOrgApprovalOrgApprovalUpdater(payload, store);
      rejectOrgApprovalNotificationUpdater(payload, store, viewerId);
      rejectOrgApprovalTeamMemberUpdater(payload, store);
      rejectOrgApprovalTaskUpdater(payload, store, viewerId);
    },
    optimisticUpdater: (store) => {
      const {notificationId} = variables;
      handleRemoveNotifications(notificationId, store, viewerId);
    },
    onCompleted,
    onError
  });
};

export default RejectOrgApprovalMutation;
