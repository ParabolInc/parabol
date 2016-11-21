export default function getNewSortOrder(actions, sourceSortOrder, targetSortOrder, isDesc, sortField) {
  const isMovingLeft = isDesc ? sourceSortOrder <= targetSortOrder : sourceSortOrder >= targetSortOrder;
  const targetIdx = actions.findIndex((action) => action[sortField] === targetSortOrder);
  const afterTarget = isMovingLeft ? actions[targetIdx - 1] : actions[targetIdx + 1];
  if (afterTarget) {
    return (afterTarget[sortField] + targetSortOrder) / 2;
  }
  return (isDesc === isMovingLeft) ? targetSortOrder + 1 : targetSortOrder - 1;
}
