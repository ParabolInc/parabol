import {commitMutation} from 'react-relay';
import {clearNotificationUpdater} from 'universal/mutations/ClearNotificationMutation';

const mutation = graphql`
  mutation CancelTeamInviteMutation($inviteId: ID!) {
    cancelTeamInvite(inviteId: $inviteId) {
      deletedIds
    }
  }
`;

const CancelTeamInviteMutation = (environment, inviteId, onError, onCompleted) => {
  const {viewerId} = environment;
  return commitMutation(environment, {
    mutation,
    variables: {inviteId},
    updater: (store) => {
      const viewer = store.get(viewerId);
      const deletedIds = store.getRootField('cancelTeamInvite').getValue('deletedIds');
      clearNotificationUpdater(viewer, deletedIds);
    },
    // optimisticUpdater: (store) => {
    // TODO add the new updatedAt or tokenExpiration to the list
    // },
    onCompleted,
    onError
  });
};

export default CancelTeamInviteMutation;
