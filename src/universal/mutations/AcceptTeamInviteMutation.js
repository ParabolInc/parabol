import {commitMutation} from 'react-relay';

const mutation = graphql`
  mutation AcceptTeamInviteMutation($dbNotificationId: ID!) {
    acceptTeamInviteNotification(dbNotificationId: $dbNotificationId) {
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

const AcceptTeamInviteMutation = (environment, dbNotificationId, onError, onCompleted) => {
  // const {viewerId} = environment;
  return commitMutation(environment, {
    mutation,
    variables: {dbNotificationId},
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
