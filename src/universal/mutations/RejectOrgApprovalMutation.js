import {commitMutation} from 'react-relay';
import {handleRemoveOrgApproval} from 'universal/mutations/CancelApprovalMutation';
import {clearNotificationUpdater} from 'universal/mutations/ClearNotificationMutation';

const mutation = graphql`
  mutation RejectOrgApprovalMutation($notificationId: ID!, $reason: String!) {
    rejectOrgApproval(notificationId: $notificationId, reason: $reason) {
      notifications {
        id
      }
      orgApprovals {
        id
        teamId
      }
    }
  }
`;


const RejectOrgApprovalMutation = (environment, variables, onError, onCompleted) => {
  const {viewerId} = environment;
  return commitMutation(environment, {
    mutation,
    variables,
    updater: (store) => {
      const viewer = store.get(viewerId);
      const payload = store.getRootField('rejectOrgApproval');
      const notifications = payload.getLinkedRecords('notifications');
      const notificationIds = notifications.map((notification) => notification.getValue('id'));
      clearNotificationUpdater(viewer, notificationIds);

      const orgApprovals = payload.getLinkedRecords('orgApprovals');
      orgApprovals.forEach((orgApproval) => {
        const teamId = orgApproval.getValue('teamId');
        const orgApprovalId = orgApproval.getValue('id');
        handleRemoveOrgApproval(store, teamId, orgApprovalId);
      });
    },
    optimisticUpdater: (store) => {
      const viewer = store.get(viewerId);
      const notificationIds = [variables.notificationId];
      clearNotificationUpdater(viewer, notificationIds);
    },
    onCompleted,
    onError
  });
};

export default RejectOrgApprovalMutation;
