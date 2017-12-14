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
    return dragged.sortOrder;
  } else if (target == null) {
    throw new Error('`target` cannot be null if `boundng` is not null');
  }
  if (boundng == null) {
    return target.sortOrder + ((SORT_STEP + dndNoise()) * (before ? 1 : -1));
  }
  return boundng.id === dragged.id
    ? boundng.sortOrder
    : (boundng.sortOrder + target.sortOrder) / 2 + dndNoise();
}
