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

const addNodeToArray = (newNode, parent, arrayName, sortValue, options = {}) => {
  if (!newNode || !parent) return;
  const {descending, storageKeyArgs} = options;
  // create an empty array so we don't have to make sure all of our mutations are bullet proof.
  // alternative is to test every page pre & post refresh, which would suck
  const arr = parent.getLinkedRecords(arrayName, storageKeyArgs) || [];
  if (!arr) return;
  const nodeDataId = newNode.getDataID();
  // rule out duplicates
  for (let ii = 0; ii < arr.length; ii++) {
    const node = arr[ii];
    if (node.getDataID() === nodeDataId) return;
  }
  const newName = newNode.getValue(sortValue);
  const idxFinder = descending ? getDescendingIdx : getAscendingIdx;
  const nextIdx = idxFinder(newName, arr, sortValue);
  const newArr = [...arr.slice(0, nextIdx), newNode, ...arr.slice(nextIdx)];
  parent.setLinkedRecords(newArr, arrayName, storageKeyArgs);
};

export default addNodeToArray;
