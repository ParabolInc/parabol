import {commitMutation} from 'react-relay';
import handleRemoveNotifications from 'universal/mutations/handlers/handleRemoveNotifications';
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
      const payload = store.getRootField('rejectOrgApproval');
      const removedRequestNotifications = payload.getLinkedRecords('removedRequestNotifications');
      const removedOrgApprovals = payload.getLinkedRecords('removedOrgApprovals');
      handleRemoveNotifications(removedRequestNotifications, store, viewerId);
      handleRemoveOrgApprovals(removedOrgApprovals, store);
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
