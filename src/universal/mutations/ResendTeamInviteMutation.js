import {commitMutation} from 'react-relay';

const mutation = graphql`
  mutation ResendTeamInviteMutation($inviteId: ID!) {
    resendTeamInvite(inviteId: $inviteId) {
      invitation {
        updatedAt
      }
    }
    
  }
`;

const ResendTeamInviteMutation = (environment, inviteId, onError, onCompleted) => {
  return commitMutation(environment, {
    mutation,
    variables: {inviteId},
    optimisticUpdater: (store) => {
      const now = new Date();
      store.get(inviteId).setValue(now.toJSON(), 'updatedAt');
    },
    onCompleted,
    onError
  });
};

export default ResendTeamInviteMutation;
