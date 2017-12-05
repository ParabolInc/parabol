const getDescendingIdx = (newName, arr, sortValue) => {
  let nextIdx;
  for (nextIdx = 0; nextIdx < arr.length; nextIdx++) {
    const node = arr[nextIdx];
    if (!node) continue;
    const nodeName = node.getValue(sortValue);
    if (nodeName < newName) break;
  }
  return nextIdx;
};

const getAscendingIdx = (newName, arr, sortValue) => {
  let nextIdx;
  for (nextIdx = 0; nextIdx < arr.length; nextIdx++) {
    const node = arr[nextIdx];
    if (!node) continue;
    const nodeName = node.getValue(sortValue);
    if (nodeName > newName) break;
  }
  return nextIdx;
};

const addNodeToArray = (node, parent, arrayName, sortValue, options = {}) => {
  const {descending, linkedRecordFilter} = options;
  const arr = parent.getLinkedRecords(arrayName, linkedRecordFilter);
  if (!arr) return;
  const newName = node.getValue(sortValue);
  const idxFinder = descending ? getDescendingIdx : getAscendingIdx;
  const nextIdx = idxFinder(newName, arr, sortValue);
  const newArr = [...arr.slice(0, nextIdx), node, ...arr.slice(nextIdx)];
  parent.setLinkedRecords(newArr, arrayName);
};

export default addNodeToArray;
