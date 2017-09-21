import {commitMutation} from 'react-relay';

const mutation = graphql`
  mutation SetOrgUserRoleMutation($orgId: ID!, $userId: ID!, $role: String) {
    setOrgUserRole(orgId: $orgId, userId: $userId, role: $role)
  }
`;

// export const clearNotificationUpdater = (viewer, deletedGlobalIds) => {
//  const notifications = viewer.getLinkedRecords('notifications');
//  if (notifications) {
//    const newNodes = getArrayWithoutIds(notifications, deletedGlobalIds);
//    viewer.setLinkedRecords(newNodes, 'notifications');
//  }
// };

const SetOrgUserRoleMutation = (environment, orgId, userId, role, onError, onCompleted) => {
  // const {viewerId} = environment;
  return commitMutation(environment, {
    mutation,
    variables: {orgId, userId, role},
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

export default SetOrgUserRoleMutation;
