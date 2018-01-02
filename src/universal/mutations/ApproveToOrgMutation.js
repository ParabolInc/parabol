import {commitMutation} from 'react-relay';
import {ConnectionHandler} from 'relay-runtime';
import getNotificationsConn from 'universal/mutations/connections/getNotificationsConn';
import handleAddInvitations from 'universal/mutations/handlers/handleAddInvitations';
import handleRemoveNotifications from 'universal/mutations/handlers/handleRemoveNotifications';
import handleRemoveOrgApprovals from 'universal/mutations/handlers/handleRemoveOrgApprovals';
import filterNodesInConn from 'universal/utils/relay/filterNodesInConn';
import getInProxy from 'universal/utils/relay/getInProxy';

const mutation = graphql`
  mutation ApproveToOrgMutation($email: String!, $orgId: ID!) {
    approveToOrg(email: $email, orgId: $orgId) {
      removedRequestNotifications {
        id
      }
      removedOrgApprovals {
        teamId
        id
      }
      newInvitations {
        id
        email
        updatedAt  
      }
    }
  }
`;

const ApproveToOrgMutation = (environment, email, orgId, onError, onCompleted) => {
  const {viewerId} = environment;
  return commitMutation(environment, {
    mutation,
    variables: {email, orgId},
    updater: (store) => {
      const payload = store.getRootField('approveToOrg');
      const removedRequestNotifications = payload.getLinkedRecords('removedRequestNotifications');
      const removedOrgApprovals = payload.getLinkedRecords('removedOrgApprovals');
      const newInvitations = payload.getLinkedRecords('newInvitations');
      const notificationIds = getInProxy(removedRequestNotifications, 'id');
      const orgApprovalIds = getInProxy(removedOrgApprovals, 'id');
      handleRemoveNotifications(notificationIds, store, viewerId);
      handleRemoveOrgApprovals(orgApprovalIds, store);
      handleAddInvitations(newInvitations, store);
    },
    optimisticUpdater: (store) => {
      const viewer = store.get(viewerId);
      const conn = getNotificationsConn(viewer);
      const notifications = filterNodesInConn(
        conn,
        (node) => node.getValue('inviteeEmail') === email && node.getValue('orgId') === orgId
      );
      const notificationIds = getInProxy(notifications, 'id');
      handleRemoveNotifications(notificationIds, store, viewerId);
    },
    onCompleted,
    onError
  });
};

export default ApproveToOrgMutation;
