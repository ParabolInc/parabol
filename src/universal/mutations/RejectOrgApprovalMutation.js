import {commitMutation} from 'react-relay';
import {handleRemovedNotifications} from 'universal/mutations/ApproveToOrgMutation';
import {clearNotificationUpdater} from 'universal/mutations/ClearNotificationMutation';
import handleRemoveOrgApprovals from 'universal/mutations/handlers/handleRemoveOrgApprovals';

const mutation = graphql`
  mutation RejectOrgApprovalMutation($notificationId: ID!, $reason: String!) {
    rejectOrgApproval(notificationId: $notificationId, reason: $reason) {
      removedRequestNotifications {
        id
      }
      removedOrgApprovals {
        id
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
      const removedRequestNotifications = payload.getLinkedRecords('removedRequestNotifications');
      const removedOrgApprovals = payload.getLinkedRecords('removedOrgApprovals');
      handleRemovedNotifications(viewer, removedRequestNotifications);
      handleRemoveOrgApprovals(removedOrgApprovals, store);
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
