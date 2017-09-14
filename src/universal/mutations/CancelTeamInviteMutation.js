import {commitMutation} from 'react-relay';

const mutation = graphql`
  mutation CancelTeamInviteMutation($inviteId: ID!) {
    cancelTeamInvite(inviteId: $inviteId)
  }
`;

const CancelTeamInviteMutation = (environment, inviteId, onError, onCompleted) => {
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

export default CancelTeamInviteMutation;
