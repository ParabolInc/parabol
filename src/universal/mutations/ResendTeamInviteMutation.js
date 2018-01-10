import {commitMutation} from 'react-relay';

graphql`
  fragment ResendTeamInviteMutation_invitation on ResendTeamInvitePayload {
    invitation {
      updatedAt
    }
  }
`;
const mutation = graphql`
  mutation ResendTeamInviteMutation($inviteId: ID!) {
    resendTeamInvite(inviteId: $inviteId) {
     ...ResendTeamInviteMutation_invitation @relay(mask: false) 
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
