import {SORT_STEP} from './constants';

export default function getNextSortOrder(arr, sortField) {
  const maxVal = Math.max(...arr.map(val => val[sortField]));
  // if it is an empty array, maxVal === -Infinity
  return Math.max(0, maxVal + SORT_STEP);
}
