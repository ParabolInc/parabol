// @flow

import {SORT_STEP} from 'universal/utils/constants';
import dndNoise from 'universal/utils/dndNoise';

type Sortable = {
  id: string,
  sortOrder: number
};

/**
 * Computes the sort order of a project to be sandwiched between
 * `target` and `boundng`.
 */
export default function sortOrderBetween(
  target: ?Sortable,
  boundng: ?Sortable,
  dragged: Sortable,
  before: boolean
): number {
  if (target == null && boundng == null) {
    // if we have the chance to reset the decimals, do it!
    return SORT_STEP;
  } else if (target == null) {
    throw new Error('`target` cannot be null if `boundng` is not null');
  }
  if (boundng == null) {
    return target.sortOrder + ((SORT_STEP + dndNoise()) * (before ? 1 : -1));
  }
  // dragged is undefined if it has moved columns mid-drag
  return boundng.id === (dragged && dragged.id)
    ? boundng.sortOrder
    : (boundng.sortOrder + target.sortOrder) / 2 + dndNoise();
}
