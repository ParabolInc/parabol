import {commitMutation} from 'react-relay';
import {showInfo} from 'universal/modules/toast/ducks/toastDuck';
import handleAddNotifications from 'universal/mutations/handlers/handleAddNotifications';
import handleRemoveNotifications from 'universal/mutations/handlers/handleRemoveNotifications';
import handleRemoveOrgApprovals from 'universal/mutations/handlers/handleRemoveOrgApprovals';
import getInProxy from 'universal/utils/relay/getInProxy';

graphql`
  fragment RejectOrgApprovalMutation_orgApproval on RejectOrgApprovalPayload {
    removedOrgApprovals {
      id
    }
  }
`;

graphql`
  fragment RejectOrgApprovalMutation_notification on RejectOrgApprovalPayload {
    deniedNotification {
      type
      ...DenyNewUser_notification @relay(mask: false)
    }
    removedRequestNotifications {
      id
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
  const inviteeEmail = getInProxy(payload, 'deniedNotification', 'inviteeEmail');
  if (!inviteeEmail) return;
  dispatch(showInfo({
    autoDismiss: 10,
    title: 'Oh no!',
    message: `${inviteeEmail} was denied to join the team.`,
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
  const orgApprovalIds = getInProxy(removedOrgApprovals, 'id');
  handleRemoveOrgApprovals(orgApprovalIds, store);
};

export const rejectOrgApprovalNotificationUpdater = (payload, store, viewerId, options) => {
  const removedRequestNotifications = payload.getLinkedRecords('removedRequestNotifications');
  const notificationIds = getInProxy(removedRequestNotifications, 'id');
  handleRemoveNotifications(notificationIds, store, viewerId);

  const deniedNotification = payload.getLinkedRecords('deniedNotification');
  handleAddNotifications(deniedNotification, store, viewerId);
  if (options) {
    popDeniedOrgApprovalToast(payload, options);
  }
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
