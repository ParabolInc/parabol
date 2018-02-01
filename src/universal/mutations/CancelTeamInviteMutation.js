import {commitMutation} from 'react-relay';
import handleRemoveInvitations from 'universal/mutations/handlers/handleRemoveInvitations';
import handleRemoveNotifications from 'universal/mutations/handlers/handleRemoveNotifications';
import getInProxy from 'universal/utils/relay/getInProxy';
import handleRemoveSoftTeamMembers from 'universal/mutations/handlers/handleRemoveSoftTeamMembers';
import handleUpsertProjects from 'universal/mutations/handlers/handleUpsertProjects';

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

graphql`
  fragment CancelTeamInviteMutation_project on CancelTeamInvitePayload {
    archivedSoftProjects {
      id
      content
      tags
      teamId
    }
  }
`;

graphql`
  fragment CancelTeamInviteMutation_teamMember on CancelTeamInvitePayload {
    removedSoftTeamMember {
      id
      teamId
    }
  }
`;

const mutation = graphql`
  mutation CancelTeamInviteMutation($invitationId: ID!) {
    cancelTeamInvite(invitationId: $invitationId) {
      ...CancelTeamInviteMutation_invitation @relay(mask: false)
      ...CancelTeamInviteMutation_notification @relay(mask: false)
      ...CancelTeamInviteMutation_teamMember @relay(mask: false)
      ...CancelTeamInviteMutation_project @relay(mask: false)
    }
  }
`;

export const cancelTeamInviteProjectUpdater = (payload, store, viewerId) => {
  const archivedSoftProjects = payload.getLinkedRecords('archivedSoftProjects');
  handleUpsertProjects(archivedSoftProjects, store, viewerId);
};

export const cancelTeamInviteTeamMemberUpdater = (payload, store) => {
  const removedSoftTeamMember = payload.getLinkedRecord('removedSoftTeamMember');
  handleRemoveSoftTeamMembers(removedSoftTeamMember, store);
};

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
      cancelTeamInviteTeamMemberUpdater(payload, store);
      cancelTeamInviteProjectUpdater(payload, store, viewerId);
    },
    optimisticUpdater: (store) => {
      const invitationProxy = store.get(invitationId);
      invitationProxy.setValue(teamId, 'teamId');
      handleRemoveInvitations(invitationProxy, store);
    },
    onCompleted,
    onError
  });
};

export default CancelTeamInviteMutation;
