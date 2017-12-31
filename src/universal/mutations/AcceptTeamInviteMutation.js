import {commitMutation} from 'react-relay';
import handleAddTeams from 'universal/mutations/handlers/handleAddTeams';
import handleRemoveNotifications from 'universal/mutations/handlers/handleRemoveNotifications';

const mutation = graphql`
  mutation AcceptTeamInviteMutation($notificationId: ID!) {
    acceptTeamInviteNotification(notificationId: $notificationId) {
      team {
        id
        isPaid
        name
      }
    }
  }
`;

const AcceptTeamInviteMutation = (environment, notificationId, onError, onCompleted) => {
  const {viewerId} = environment;
  return commitMutation(environment, {
    mutation,
    variables: {notificationId},
    updater: (store) => {
      const payload = store.getRootField('acceptTeamInviteNotification');
      const team = payload.getLinkedRecord('team');
      handleAddTeams(team, store, viewerId);
      handleRemoveNotifications(notificationId, store, viewerId);
    },
    onCompleted,
    onError
  });
};

export default AcceptTeamInviteMutation;
