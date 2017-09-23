const filterNodesInConn = (connection, findFn) => {
  const filteredNodes = [];
  const edges = connection.getLinkedRecords('edges');
  if (!edges) return filteredNodes;
  for (let ii = 0; ii < edges.length; ii++) {
    const edge = edges[ii];
    if (!edge) continue;
    const node = edge.getLinkedRecord('node');
    if (!node) continue;
    if (findFn(node) === true) {
      filteredNodes.push(node);
    }
  }
  return filteredNodes;
};

export default filterNodesInConn;
