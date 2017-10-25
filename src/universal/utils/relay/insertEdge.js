export const insertEdgeBefore = (connection, newEdge, propName) => {
  const edges = connection.getLinkedRecords('edges');
  const newName = newEdge.getLinkedRecord('node').getValue(propName);
  const newEdgeIdx = edges.findIndex((edge) => {
    const edgeName = edge ? edge.getLinkedRecord('node').getValue(propName) : '';
    return edgeName > newName;
  });
  const nextEdges = newEdgeIdx === -1 ?
    edges.concat(newEdge) :
    [...edges.slice(0, newEdgeIdx), newEdge, ...edges.slice(newEdgeIdx)];
  connection.setLinkedRecords(nextEdges, 'edges');
};

export const insertNodeBefore = (nodes, newNode, propName) => {
  const newName = newNode.getValue(propName);
  const newIdx = nodes.findIndex((node) => {
    const nodeName = node ? node.getValue(propName) : '';
    return nodeName > newName ? 1 : -1;
  });
  return newIdx === -1 ? nodes.concat(newNode) : [...nodes.slice(0, newIdx), newNode, ...nodes.slice(newIdx)];
};

// will build when needed
export const insertEdgeAfter = (connection, newEdge, propName) => {
  const edges = connection.getLinkedRecords('edges');
  const newName = newEdge.getLinkedRecord('node').getValue(propName);
  const newEdgeIdx = edges.findIndex((edge) => {
    const edgeName = edge ? edge.getLinkedRecord('node').getValue(propName) : '';
    return edgeName < newName;
  });
  const nextEdges = newEdgeIdx === -1 ?
    [newEdge, ...edges] :
    [...edges.slice(0, newEdgeIdx), newEdge, ...edges.slice(newEdgeIdx)];
  connection.setLinkedRecords(nextEdges, 'edges');
};
