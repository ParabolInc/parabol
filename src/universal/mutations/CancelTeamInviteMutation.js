import {commitMutation} from 'react-relay';
import handleRemoveInvitations from 'universal/mutations/handlers/handleRemoveInvitations';
import handleRemoveNotifications from 'universal/mutations/handlers/handleRemoveNotifications';

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

const CancelTeamInviteMutation = (environment, inviteId, teamId, onError, onCompleted) => {
  const {viewerId} = environment;
  return commitMutation(environment, {
    mutation,
    variables: {inviteId},
    updater: (store) => {
      const payload = store.getRootField('cancelTeamInvite');
      const deletedNotificationId = payload.getValue('deletedNotificationId');
      handleRemoveNotifications(deletedNotificationId, store, viewerId);
      handleRemoveInvitations(inviteId, store);
    },
    optimisticUpdater: (store) => {
      handleRemoveInvitations(inviteId, store);
    },
    onCompleted,
    onError
  });
};

export default CancelTeamInviteMutation;
