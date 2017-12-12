import {commitMutation} from 'react-relay';
import {ConnectionHandler} from 'relay-runtime';
import {clearNotificationUpdater} from 'universal/mutations/ClearNotificationMutation';
import filterNodesInConn from 'universal/utils/relay/filterNodesInConn';

const mutation = graphql`
  mutation ApproveToOrgMutation($email: String!, $orgId: ID!) {
    approveToOrg(email: $email, orgId: $orgId) {
      deletedIds
    }
  }
`;

const ApproveToOrgMutation = (environment, email, orgId, onError, onCompleted) => {
  const {viewerId} = environment;
  return commitMutation(environment, {
    mutation,
    variables: {email, orgId},
    updater: (store) => {
      const viewer = store.get(viewerId);
      const deletedIds = store.getRootField('approveToOrg').getValue('deletedIds');
      clearNotificationUpdater(viewer, deletedIds);
    },
    optimisticUpdater: (store) => {
      const viewer = store.get(viewerId);
      const conn = ConnectionHandler.getConnection(
        viewer,
        'DashboardWrapper_notifications'
      );
      const matchingNodes = filterNodesInConn(conn, (node) => node.getValue('inviteeEmail') === email && node.getValue('orgId') === orgId);
      const deletedIds = matchingNodes.map((node) => node.getValue('id'));
      deletedIds.forEach((deletedId) => {
        ConnectionHandler.deleteNode(conn, deletedId);
      });
    },
    onCompleted,
    onError
  });
};

export default ApproveToOrgMutation;
