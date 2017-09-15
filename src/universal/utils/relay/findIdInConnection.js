const findIdInConnection = (id, connection) => {
  const edges = connection.getLinkedRecords('edges');
  if (!edges) return -1;
  for (let ii = 0; ii < edges.length; ii++) {
    const edge = edges[ii];
    if (!edge) continue;
    const node = edge.getLinkedRecord('node');
    if (!node) continue;
    const nodeId = node.getValue('id');
    if (nodeId === id) return ii;
  }
  return -1;
};

export default findIdInConnection;
