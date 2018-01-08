import {commitMutation} from 'react-relay';
import {showInfo} from 'universal/modules/toast/ducks/toastDuck';
import ClearNotificationMutation from 'universal/mutations/ClearNotificationMutation';
import getNotificationsConn from 'universal/mutations/connections/getNotificationsConn';
import handleAddInvitations from 'universal/mutations/handlers/handleAddInvitations';
import handleAddNotifications from 'universal/mutations/handlers/handleAddNotifications';
import handleRemoveNotifications from 'universal/mutations/handlers/handleRemoveNotifications';
import handleRemoveOrgApprovals from 'universal/mutations/handlers/handleRemoveOrgApprovals';
import popTeamInviteNotificationToast from 'universal/mutations/toasts/popTeamInviteNotificationToast';
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
      id
      teamId
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
      type
      ...InviteeApproved_notification @relay(mask: false)
    }
    teamInviteNotifications {
      type
      ...TeamInvite_notification @relay(mask: false)
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

const popInviteeApprovedToast = (payload, {dispatch, environment}) => {
  const notifications = payload.getLinkedRecords('inviteeApprovedNotifications');
  const inviteeEmails = getInProxy(notifications, 'inviteeEmail');
  if (!inviteeEmails || inviteeEmails.length === 0) return;
  // the server reutrns a notification for each team the invitee was approved to, but we only need 1 toast
  const [inviteeEmail] = inviteeEmails;
  dispatch(showInfo({
    autoDismiss: 10,
    title: 'Approved!',
    message: `${inviteeEmail} has been approved by your organization. We just sent them an invitation.`,
    action: {
      label: 'Great!',
      callback: () => {
        const notificationIds = getInProxy(notifications, 'id');
        notificationIds.forEach((notificationId) => {
          ClearNotificationMutation(environment, notificationId);
        });
      }
    }
  }));
};

export const approveToOrgOrganizationUpdater = (payload, store, viewerId) => {
  const removedRequestNotifications = payload.getLinkedRecords('removedRequestNotifications');
  const notificationIds = getInProxy(removedRequestNotifications, 'id');
  handleRemoveNotifications(notificationIds, store, viewerId);
};

export const approveToOrgOrgApprovalUpdater = (payload, store) => {
  const removedOrgApprovals = payload.getLinkedRecords('removedOrgApprovals');
  handleRemoveOrgApprovals(removedOrgApprovals, store);
};

export const approveToOrgInvitationUpdater = (payload, store) => {
  const newInvitations = payload.getLinkedRecords('newInvitations');
  handleAddInvitations(newInvitations, store);
};

export const approveToOrgNotificationUpdater = (payload, store, viewerId, options) => {
  const notifications = payload.getLinkedRecords('inviteeApprovedNotifications');
  handleAddNotifications(notifications, store, viewerId);
  popInviteeApprovedToast(payload, options);

  const teamInviteNotifications = payload.getLinkedRecords('teamInviteNotifications');
  handleAddNotifications(teamInviteNotifications, store, viewerId);
  if (teamInviteNotifications) {
    teamInviteNotifications.forEach((notification) => {
      popTeamInviteNotificationToast(notification, options);
    });
  }
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
