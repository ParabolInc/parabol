import {SORT_STEP} from './constants';

export default function getNextSortOrder(arr, sortField) {
  const lastEntity = arr[arr.length - 1];
  return lastEntity ? lastEntity[sortField] + SORT_STEP : 0;
}
