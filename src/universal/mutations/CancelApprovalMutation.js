import {commitMutation} from 'react-relay';
import handleRemoveNotifications from 'universal/mutations/handlers/handleRemoveNotifications';
import handleRemoveOrgApprovals from 'universal/mutations/handlers/handleRemoveOrgApprovals';
import getInProxy from 'universal/utils/relay/getInProxy';

graphql`
  fragment CancelApprovalMutation_orgApproval on CancelApprovalPayload {
    orgApproval {
      id
    }
  }
`;

graphql`
  fragment CancelApprovalMutation_notification on CancelApprovalPayload {
    removedRequestNotification {
      id
    }
  }
`;

const mutation = graphql`
  mutation CancelApprovalMutation($orgApprovalId: ID!) {
    cancelApproval(orgApprovalId: $orgApprovalId) {
      ...CancelApprovalMutation_notification @relay(mask: false)
      ...CancelApprovalMutation_orgApproval @relay(mask: false)
    }
  }
`;

export const cancelApprovalOrgApprovalUpdater = (payload, store) => {
  const orgApprovalId = getInProxy(payload, 'orgApproval', 'id');
  handleRemoveOrgApprovals(orgApprovalId, store);
};

export const cancelApprovalNotificationUpdater = (payload, store, viewerId) => {
  const notificationId = getInProxy(payload, 'removedRequestNotification', 'id');
  handleRemoveNotifications(notificationId, store, viewerId);
};

const CancelApprovalMutation = (environment, orgApprovalId, teamId, onError, onCompleted) => {
  const {viewerId} = environment;
  return commitMutation(environment, {
    mutation,
    variables: {orgApprovalId},
    updater: (store) => {
      const payload = store.getRootField('cancelApproval');
      cancelApprovalNotificationUpdater(payload, store, viewerId);
      cancelApprovalOrgApprovalUpdater(payload, store);
    },
    optimisticUpdater: (store) => {
      handleRemoveOrgApprovals(orgApprovalId, store);
    },
    onCompleted,
    onError
  });
};

export default CancelApprovalMutation;
