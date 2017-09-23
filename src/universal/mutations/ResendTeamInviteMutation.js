import {commitMutation} from 'react-relay';

const mutation = graphql`
  mutation ResendTeamInviteMutation($inviteId: ID!) {
    resendTeamInvite(inviteId: $inviteId)
  }
`;

const ResendTeamInviteMutation = (environment, inviteId, onError, onCompleted) => {
  return commitMutation(environment, {
    mutation,
    variables: {inviteId},
    // updater: (store) => {
    // const viewer = store.get(viewerId);
    // const deletedId = store.getRootField('acceptTeamInvite').getValue('deletedId');
    // clearNotificationUpdater(viewer, deletedId);
    // },
    // optimisticUpdater: (store) => {
    // TODO add the new updatedAt or tokenExpiration to the list
    // },
    onCompleted,
    onError
  });
};

export default ResendTeamInviteMutation;
