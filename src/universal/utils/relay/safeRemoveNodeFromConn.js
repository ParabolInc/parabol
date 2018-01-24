import {ConnectionHandler} from 'relay-runtime';

const safeRemoveNodeFromConn = (nodeId, conn) => {
  if (conn) {
    ConnectionHandler.deleteNode(conn, nodeId);
  }
};

export default safeRemoveNodeFromConn;
