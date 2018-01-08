import {ConnectionHandler} from 'relay-runtime';

const safeRemoveNodeFromConn = (nodeId, conn) => {
  if (conn) {
    // const matchingNode = getNodeById(nodeId, conn);
    // if (matchingNode) {
    ConnectionHandler.deleteNode(conn, nodeId);
    // }
  }
};

export default safeRemoveNodeFromConn;
