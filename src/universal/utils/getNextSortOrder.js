import {SORT_STEP} from './constants';

export default function getNextSortOrder(arr, sortField) {
  // we always do a decremental sort
  const lastEntity = arr[0];
  return lastEntity ? lastEntity[sortField] + SORT_STEP : 0;
}
