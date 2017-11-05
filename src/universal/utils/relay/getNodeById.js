import filterNodesInConn from 'universal/utils/relay/filterNodesInConn';

const getNodeById = (nodeId, conn) => filterNodesInConn(conn, (node) => node.getValue('id') === nodeId)[0];

export default getNodeById;