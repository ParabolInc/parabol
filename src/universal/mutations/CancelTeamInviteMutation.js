import {commitMutation} from 'react-relay';
import handleRemoveInvitations from 'universal/mutations/handlers/handleRemoveInvitations';

const mutation = graphql`
  mutation CancelTeamInviteMutation($invitationId: ID!) {
    cancelTeamInvite(invitationId: $invitationId) {
      invitation {
        id
      }
    }
  }
`;

const CancelTeamInviteMutation = (environment, invitationId, teamId, onError, onCompleted) => {
  return commitMutation(environment, {
    mutation,
    variables: {invitationId},
    updater: (store) => {
      handleRemoveInvitations(invitationId, store, teamId);
    },
    optimisticUpdater: (store) => {
      handleRemoveInvitations(invitationId, store, teamId);
    },
    onCompleted,
    onError
  });
};

export default CancelTeamInviteMutation;
