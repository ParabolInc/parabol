import {commitMutation} from 'react-relay';
import {handleAddTeamToViewerTeams} from 'universal/mutations/AddTeamMutation';

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
      const team = store.getRootField('acceptTeamInviteNotification').getLinkedRecord('team');
      handleAddTeamToViewerTeams(store, viewerId, team);
    },
    onCompleted,
    onError
  });
};

export default AcceptTeamInviteMutation;
