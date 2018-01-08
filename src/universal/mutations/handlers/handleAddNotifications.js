import {ConnectionHandler} from 'relay-runtime';
import getNotificationsConn from 'universal/mutations/connections/getNotificationsConn';
import pluralizeHandler from 'universal/mutations/handlers/pluralizeHandler';
import filterNodesInConn from 'universal/utils/relay/filterNodesInConn';

const handleAddNotification = (newNode, store, viewerId) => {
  const viewer = store.get(viewerId);
  const conn = getNotificationsConn(viewer);
  if (!conn) return;
  const nodeId = newNode.getValue('id');
  const matchingNodes = filterNodesInConn(conn, (node) => node.getValue('id') === nodeId);
  if (matchingNodes.length === 0) {
    const newEdge = ConnectionHandler.createEdge(
      store,
      conn,
      newNode,
      'NotificationEdge'
    );
    newEdge.setValue(newNode.getValue('startAt'), 'cursor');
    ConnectionHandler.insertEdgeBefore(conn, newEdge);
  }
};

const handleAddNotifications = pluralizeHandler(handleAddNotification);
export default handleAddNotifications;
