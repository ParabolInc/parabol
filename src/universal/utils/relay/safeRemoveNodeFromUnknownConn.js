/*
 * Sometimes a node may exist in 1 of many different connections.
 * This removes it from the first one it is found in
 */
import getAllConnections from 'universal/utils/relay/getAllConnections';
import findConnectionWithNodeId from 'universal/utils/relay/findConnectionWithNodeId';
import safeRemoveNodeFromConn from 'universal/utils/relay/safeRemoveNodeFromConn';

const safeRemoveNodeFromUnknownConn = (store, viewerId, connectionName, nodeId) => {
  if (!nodeId) return;
  const teamConnections = getAllConnections(store, viewerId, connectionName);
  const conn = findConnectionWithNodeId(teamConnections, nodeId);
  safeRemoveNodeFromConn(nodeId, conn);
};

export default safeRemoveNodeFromUnknownConn;
