const safeRemoveNodeFromArray = (nodeId, parent, arrayName, arrayOptions) => {
  if (!nodeId || !parent) return;
  const arr = parent.getLinkedRecords(arrayName, arrayOptions);
  if (!arr) return;
  const matchingNodeIdx = arr.findIndex((node) => node && node.getValue('id') === nodeId);
  if (matchingNodeIdx === -1) return;
  const newArr = [...arr.slice(0, matchingNodeIdx), ...arr.slice(matchingNodeIdx + 1)];
  parent.setLinkedRecords(newArr, arrayName);
};

export default safeRemoveNodeFromArray;
