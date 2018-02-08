const connectionFromTasks = (nodes) => {
  const edges = nodes.map((node) => ({
    cursor: node.updatedAt,
    node
  }));
  const firstEdge = edges[0];
  return {
    edges,
    pageInfo: {
      endCursor: firstEdge ? edges[edges.length - 1].cursor : new Date(),
      hasNextPage: false
    }
  };
};

export default connectionFromTasks;
