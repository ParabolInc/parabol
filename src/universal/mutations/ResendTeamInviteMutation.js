import {commitMutation} from 'react-relay';

const mutation = graphql`
  mutation ResendTeamInviteMutation($inviteId: ID!) {
    resendTeamInvite(inviteId: $inviteId)
  }
`;

const ResendTeamInviteMutation = (environment, inviteId, onError, onCompleted) => {
  const updater = (store) => {
    const now = new Date();
    store.get(inviteId).setValue(now.toJSON(), 'updatedAt');
  };
  return commitMutation(environment, {
    mutation,
    variables: {inviteId},
    updater,
    optimisticUpdater: updater,
    onCompleted,
    onError
  });
};

export default ResendTeamInviteMutation;
