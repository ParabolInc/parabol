import {commitMutation} from 'react-relay';
import {ConnectionHandler} from 'relay-runtime';
import {clearNotificationUpdater} from 'universal/mutations/ClearNotificationMutation';
import handleAddInvitations from 'universal/mutations/handlers/handleAddInvitations';
import handleRemoveOrgApprovals from 'universal/mutations/handlers/handleRemoveOrgApprovals';
import filterNodesInConn from 'universal/utils/relay/filterNodesInConn';

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

export const handleRemovedNotifications = (viewer, notifications) => {
  if (!notifications) return;
  const deletedNotificationIds = notifications.map((n) => n.getValue('id'));
  clearNotificationUpdater(viewer, deletedNotificationIds);
};

const ApproveToOrgMutation = (environment, email, orgId, onError, onCompleted) => {
  const {viewerId} = environment;
  return commitMutation(environment, {
    mutation,
    variables: {email, orgId},
    updater: (store) => {
      const viewer = store.get(viewerId);
      const payload = store.getRootField('approveToOrg');
      const removedRequestNotifications = payload.getLinkedRecords('removedRequestNotifications');
      const removedOrgApprovals = payload.getLinkedRecords('removedOrgApprovals');
      const newInvitations = payload.getLinkedRecords('newInvitations');
      handleRemovedNotifications(viewer, removedRequestNotifications);
      handleRemoveOrgApprovals(removedOrgApprovals, store);
      handleAddInvitations(newInvitations, store);
    },
    optimisticUpdater: (store) => {
      const viewer = store.get(viewerId);
      const conn = ConnectionHandler.getConnection(
        viewer,
        'DashboardWrapper_notifications'
      );
      const matchingNodes = filterNodesInConn(conn, (node) => node.getValue('inviteeEmail') === email && node.getValue('orgId') === orgId);
      const deletedIds = matchingNodes.map((node) => node.getValue('id'));
      clearNotificationUpdater(viewer, deletedIds);
    },
    onCompleted,
    onError
  });
};

export default ApproveToOrgMutation;
