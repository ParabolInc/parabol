import filterNodesInConn from './filterNodesInConn'

const getNodeById = (nodeId, conn) =>
  filterNodesInConn(conn, (node) => node.getValue('id') === nodeId)[0]

export default getNodeById
