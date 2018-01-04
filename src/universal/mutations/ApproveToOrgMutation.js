import {commitMutation} from 'react-relay';
import getNotificationsConn from 'universal/mutations/connections/getNotificationsConn';
import handleAddInvitations from 'universal/mutations/handlers/handleAddInvitations';
import handleAddNotifications from 'universal/mutations/handlers/handleAddNotifications';
import handleRemoveNotifications from 'universal/mutations/handlers/handleRemoveNotifications';
import handleRemoveOrgApprovals from 'universal/mutations/handlers/handleRemoveOrgApprovals';
import filterNodesInConn from 'universal/utils/relay/filterNodesInConn';
import getInProxy from 'universal/utils/relay/getInProxy';


graphql`
  fragment ApproveToOrgMutation_organization on ApproveToOrgPayload {
    removedRequestNotifications {
      id
    }
  }
`;

graphql`
  fragment ApproveToOrgMutation_orgApproval on ApproveToOrgPayload {
    removedOrgApprovals {
      teamId
      id
    }
  }
`;

graphql`
  fragment ApproveToOrgMutation_invitation on ApproveToOrgPayload {
    newInvitations {
      id
      email
      updatedAt
    }
  }
`;

graphql`
  fragment ApproveToOrgMutation_notification on ApproveToOrgPayload {
    inviteeApprovedNotifications {
      id
      inviteeEmail
      team {
        id
        name
      }
    }
  }
`;

const mutation = graphql`
  mutation ApproveToOrgMutation($email: String!, $orgId: ID!) {
    approveToOrg(email: $email, orgId: $orgId) {
      ...ApproveToOrgMutation_organization @relay(mask: false)    
      ...ApproveToOrgMutation_orgApproval @relay(mask: false)
      ...ApproveToOrgMutation_invitation @relay(mask: false)
    }
  }
`;

export const approveToOrgOrganizationUpdater = (payload, store, viewerId) => {
  const removedRequestNotifications = payload.getLinkedRecords('removedRequestNotifications');
  const notificationIds = getInProxy(removedRequestNotifications, 'id');
  handleRemoveNotifications(notificationIds, store, viewerId);
};

export const approveToOrgOrgApprovalUpdater = (payload, store) => {
  const removedOrgApprovals = payload.getLinkedRecords('removedOrgApprovals');
  const orgApprovalIds = getInProxy(removedOrgApprovals, 'id');
  handleRemoveOrgApprovals(orgApprovalIds, store);
};

export const approveToOrgInvitationUpdater = (payload, store) => {
  const newInvitations = payload.getLinkedRecords('newInvitations');
  handleAddInvitations(newInvitations, store);
};

export const approveToOrgNotificationUpdater = (payload, options) => {
  const notifications = payload.getLinkedRecords('inviteeAPprovedNotifications');
  handleAddNotifications(notifications, options);
};

const ApproveToOrgMutation = (environment, email, orgId, onError, onCompleted) => {
  const {viewerId} = environment;
  return commitMutation(environment, {
    mutation,
    variables: {email, orgId},
    updater: (store) => {
      const payload = store.getRootField('approveToOrg');
      approveToOrgOrganizationUpdater(payload, store, viewerId);
      approveToOrgOrgApprovalUpdater(payload, store);
      approveToOrgInvitationUpdater(payload, store);
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
