import {commitMutation} from 'react-relay';
import {clearNotificationUpdater} from 'universal/mutations/ClearNotificationMutation';
import safeRemoveNodeFromArray from 'universal/utils/relay/safeRemoveNodeFromArray';

const mutation = graphql`
  mutation CancelTeamInviteMutation($inviteId: ID!) {
    cancelTeamInvite(inviteId: $inviteId) {
      invitation {
        id
      }
      deletedNotificationId
    }
  }
`;

export const handleRemoveInvitation = (store, teamId, invitationId) => {
  const team = store.get(teamId);
  safeRemoveNodeFromArray(invitationId, team, 'invitations');
};

const CancelTeamInviteMutation = (environment, inviteId, teamId, onError, onCompleted) => {
  const {viewerId} = environment;
  return commitMutation(environment, {
    mutation,
    variables: {inviteId},
    updater: (store) => {
      const viewer = store.get(viewerId);
      const payload = store.getRootField('cancelTeamInvite');
      const deletedNotificationId = payload.getValue('deletedNotificationId');
      if (deletedNotificationId) {
        clearNotificationUpdater(viewer, [deletedNotificationId]);
      }
      handleRemoveInvitation(store, teamId, inviteId);
    },
    optimisticUpdater: (store) => {
      handleRemoveInvitation(store, teamId, inviteId);
    },
    onCompleted,
    onError
  });
};

export default CancelTeamInviteMutation;
