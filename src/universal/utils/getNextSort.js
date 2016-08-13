import {SORT_STEP} from 'universal/utils/constants';

// written imperatively since this is gonna get called a lot
export default function getNextSort(arr, sortField) {
  let max = SORT_STEP - 1;
  for (let i = 0; i < arr.length; i++) {
    const val = arr[i][sortField];
    if (val > max) {
      max = val;
    }
  }
  return max + SORT_STEP;
}
