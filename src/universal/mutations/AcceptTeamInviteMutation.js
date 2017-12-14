import {commitMutation} from 'react-relay';

const mutation = graphql`
  mutation AcceptTeamInviteMutation($notificationId: ID!) {
    acceptTeamInviteNotification(notificationId: $notificationId) {
      authToken
      teamName
      teamId
    }
  }
`;

// export const clearNotificationUpdater = (viewer, deletedGlobalIds) => {
//  const notifications = viewer.getLinkedRecords('notifications');
//  if (notifications) {
//    const newNodes = getArrayWithoutIds(notifications, deletedGlobalIds);
//    viewer.setLinkedRecords(newNodes, 'notifications');
//  }
// };

const AcceptTeamInviteMutation = (environment, notificationId, onError, onCompleted) => {
  return commitMutation(environment, {
    mutation,
    variables: {notificationId},
    // updater: (store) => {
    // const viewer = store.get(viewerId);
    // const deletedId = store.getRootField('acceptTeamInvite').getValue('deletedId');
    // clearNotificationUpdater(viewer, deletedId);
    // },
    // optimisticUpdater: (store) => {
    // TODO add the team to the sidebar when we move teams to relay
    // },
    onCompleted,
    onError
  });
};

export default AcceptTeamInviteMutation;
