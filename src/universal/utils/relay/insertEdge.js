export const insertEdgeBefore = (connection, newEdge, propName) => {
  const edges = connection.getLinkedRecords('edges');
  const newName = newEdge.getLinkedRecord('node').getValue(propName);
  const newEdgeIdx = edges.findIndex((edge) => {
    const edgeName = edge ? edge.getLinkedRecord('node').getValue('channelName') : '';
    return edgeName > newName;
  });
  const nextEdges = newEdgeIdx === -1 ?
    edges.concat(newEdge) :
    [...edges.slice(0, newEdgeIdx), newEdge, ...edges.slice(newEdgeIdx)];
  connection.setLinkedRecords(nextEdges, 'edges');
};

// will build when needed
export const insertEdgeAfter = () => {

};
