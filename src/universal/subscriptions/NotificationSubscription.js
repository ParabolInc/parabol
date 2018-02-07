import {showWarning} from 'universal/modules/toast/ducks/toastDuck';
import {addOrgMutationNotificationUpdater} from 'universal/mutations/AddOrgMutation';
import {addTeamMutationNotificationUpdater} from 'universal/mutations/AddTeamMutation';
import {approveToOrgNotificationUpdater} from 'universal/mutations/ApproveToOrgMutation';
import {cancelApprovalNotificationUpdater} from 'universal/mutations/CancelApprovalMutation';
import {cancelTeamInviteNotificationUpdater} from 'universal/mutations/CancelTeamInviteMutation';
import {clearNotificationNotificationUpdater} from 'universal/mutations/ClearNotificationMutation';
import {createTaskNotificationUpdater} from 'universal/mutations/CreateTaskMutation';
import {deleteTaskNotificationUpdater} from 'universal/mutations/DeleteTaskMutation';
import handleAddNotifications from 'universal/mutations/handlers/handleAddNotifications';
import {inviteTeamMembersNotificationUpdater} from 'universal/mutations/InviteTeamMembersMutation';
import {rejectOrgApprovalNotificationUpdater} from 'universal/mutations/RejectOrgApprovalMutation';
import {APP_UPGRADE_PENDING_KEY, APP_UPGRADE_PENDING_RELOAD, APP_VERSION_KEY} from 'universal/utils/constants';
import getInProxy from 'universal/utils/relay/getInProxy';
import toTeamMemberId from 'universal/utils/relay/toTeamMemberId';
import {removeOrgUserNotificationUpdater} from 'universal/mutations/RemoveOrgUserMutation';

const subscription = graphql`
  subscription NotificationSubscription {
    notificationSubscription {
      __typename
      ...AddOrgMutation_notification
      ...AddTeamMutation_notification
      ...ApproveToOrgMutation_notification
      ...CancelApprovalMutation_notification
      ...CancelTeamInviteMutation_notification
      ...ClearNotificationMutation_notification
      ...CreateTaskMutation_notification
      ...DeleteTaskMutation_notification
      ...InviteTeamMembersMutation_notification
      ...RemoveOrgUserMutation_notification
      ...RejectOrgApprovalMutation_notification
      ...UpdateUserProfileMutation_notification

      # ConnectSocket/DisconnectSocket
      ... on User {
        id
        isConnected
        tms
      }

      # App Version Updater
      ... on NotifyVersionInfo {
        version
      }

      # Stripe webhooks
      ... on StripeFailPaymentPayload {
        notification {
          type
          ...PaymentRejected_notification @relay(mask: false)
        }
      }
    }
  }
`;

const connectSocketUserUpdater = (payload, store) => {
  const isConnected = payload.getValue('isConnected');
  const userId = payload.getValue('id');
  const teamIds = payload.getValue('tms');
  if (!teamIds) return;
  const teamMemberIds = teamIds.map((teamId) => toTeamMemberId(teamId, userId));
  teamMemberIds.forEach((teamMemberId) => {
    const teamMember = store.get(teamMemberId);
    if (!teamMember) return;
    teamMember.setValue(isConnected, 'isConnected');
  });
};

const popUpgradeAppToast = (payload, {dispatch, history}) => {
  const versionOnServer = payload.getValue('version');
  const versionInStorage = window.localStorage.getItem(APP_VERSION_KEY);
  if (versionOnServer !== versionInStorage) {
    dispatch(showWarning({
      title: 'New stuff!',
      message: 'A new version of Parabol is available',
      autoDismiss: 0,
      action: {
        label: 'Log out and upgrade',
        callback: () => {
          history.replace('/signout');
        }
      }
    }));
    window.sessionStorage.setItem(APP_UPGRADE_PENDING_KEY,
      APP_UPGRADE_PENDING_RELOAD);
  }
};

const popPaymentFailedToast = (payload, {dispatch, history}) => {
  const orgId = getInProxy(payload, 'organization', 'id');
  const orgName = getInProxy(payload, 'organization', 'name');
  // TODO add brand and last 4
  dispatch(showWarning({
    autoDismiss: 10,
    title: 'Oh no!',
    message: `Your credit card for ${orgName} was rejected.`,
    action: {
      label: 'Fix it!',
      callback: () => {
        history.push(`/me/organizations/${orgId}`);
      }
    }
  }));
};

const stripeFailPaymentNotificationUpdater = (payload, store, viewerId, options) => {
  const notification = payload.getLinkedRecord('notification');
  handleAddNotifications(notification, store, viewerId);
  popPaymentFailedToast(payload, options);
};

const NotificationSubscription = (environment, queryVariables, {dispatch, history, location}) => {
  const {viewerId} = environment;
  return {
    subscription,
    updater: (store) => {
      const options = {dispatch, environment, history, location, store};
      const payload = store.getRootField('notificationSubscription');
      const type = payload.getValue('__typename');
      switch (type) {
        case 'AddOrgPayload':
          addOrgMutationNotificationUpdater(payload, store, viewerId, options);
          break;
        case 'AddTeamPayload':
          addTeamMutationNotificationUpdater(payload, store, viewerId, options);
          break;
        case 'ApproveToOrgPayload':
          approveToOrgNotificationUpdater(payload, store, viewerId, options);
          break;
        case 'CancelApprovalPayload':
          cancelApprovalNotificationUpdater(payload, store, viewerId);
          break;
        case 'CancelTeamInvitePayload':
          cancelTeamInviteNotificationUpdater(payload, store, viewerId);
          break;
        case 'ClearNotificationPayload':
          clearNotificationNotificationUpdater(payload, store, viewerId);
          break;
        case 'CreateTaskPayload':
          createTaskNotificationUpdater(payload, store, viewerId, options);
          break;
        case 'DeleteTaskPayload':
          deleteTaskNotificationUpdater(payload, store, viewerId);
          break;
        case 'InviteTeamMembersPayload':
          inviteTeamMembersNotificationUpdater(payload, store, viewerId, options);
          break;
        case 'RejectOrgApprovalPayload':
          rejectOrgApprovalNotificationUpdater(payload, store, viewerId, options);
          break;
        case 'User':
          connectSocketUserUpdater(payload, store);
          break;
        case 'NotifyVersionInfo':
          popUpgradeAppToast(payload, options);
          break;
        case 'RemoveOrgUserPayload':
          removeOrgUserNotificationUpdater(payload, store, viewerId, options);
          break;
        case 'StripeFailPaymentPayload':
          stripeFailPaymentNotificationUpdater(payload, store, viewerId, options);
          break;
        case 'UpdateUserProfilePayload':
          break;
        default:
          console.error('NotificationSubscription case fail', type);
      }
    }
  };
};

export default NotificationSubscription;
