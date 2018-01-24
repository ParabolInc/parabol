import {commitMutation} from 'react-relay';
import handleRemoveInvitations from 'universal/mutations/handlers/handleRemoveInvitations';
import handleRemoveNotifications from 'universal/mutations/handlers/handleRemoveNotifications';
import getInProxy from 'universal/utils/relay/getInProxy';
import createProxyRecord from 'universal/utils/relay/createProxyRecord';

graphql`
  fragment CancelTeamInviteMutation_invitation on CancelTeamInvitePayload {
    invitation {
      id
      teamId
    }
  }
`;

graphql`
  fragment CancelTeamInviteMutation_notification on CancelTeamInvitePayload {
    removedTeamInviteNotification {
      id
    }
  }
`;

const mutation = graphql`
  mutation CancelTeamInviteMutation($invitationId: ID!) {
    cancelTeamInvite(invitationId: $invitationId) {
      ...CancelTeamInviteMutation_invitation @relay(mask: false)
      ...CancelTeamInviteMutation_notification @relay(mask: false)
    }
  }
`;

export const cancelTeamInviteInvitationUpdater = (payload, store) => {
  const invitation = payload.getLinkedRecord('invitation');
  handleRemoveInvitations(invitation, store);
};

export const cancelTeamInviteNotificationUpdater = (payload, store, viewerId) => {
  const notificationId = getInProxy(payload, 'removedTeamInviteNotification', 'id');
  handleRemoveNotifications(notificationId, store, viewerId);
};

const CancelTeamInviteMutation = (environment, invitationId, teamId, onError, onCompleted) => {
  const {viewerId} = environment;
  return commitMutation(environment, {
    mutation,
    variables: {invitationId},
    updater: (store) => {
      const payload = store.getRootField('cancelTeamInvite');
      cancelTeamInviteInvitationUpdater(payload, store);
      cancelTeamInviteNotificationUpdater(payload, store, viewerId);
    },
    optimisticUpdater: (store) => {
      const invitationProxy = createProxyRecord(store, 'Invitation', {id: invitationId, teamId});
      handleRemoveInvitations(invitationProxy, store);
    },
    onCompleted,
    onError
  });
};

export default CancelTeamInviteMutation;
