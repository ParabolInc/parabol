const getArrayWithoutIds = (array, maybeRemovalIds) => {
  const removalIds = Array.isArray(maybeRemovalIds) ? maybeRemovalIds : [maybeRemovalIds];
  const newNodes = array.slice();
  for (let i = 0; i < removalIds.length; i++) {
    const removalId = removalIds[i];
    const idxToDelete = array.findIndex((node) => node.getValue('id') === removalId);
    if (idxToDelete !== -1) {
      newNodes.splice(idxToDelete, 1);
    }
  }
  return newNodes;
};

export default getArrayWithoutIds;
