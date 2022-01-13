import {SORT_STEP} from '../utils/constants'
import dndNoise from '../utils/dndNoise'

interface Sortable {
  id: string
  sortOrder: number
}

/**
 * Computes the sort order of a task to be sandwiched between
 * `target` and `bounding`.
 */
export default function sortOrderBetween(
  target: Sortable | undefined | null,
  bounding: Sortable | undefined | null,
  toInsert: Sortable | undefined | null,
  before: boolean
): number {
  if (target === null && bounding === null && toInsert === null) {
    return 0
  }
  if (target === null && bounding === null && toInsert !== null) {
    return toInsert.sortOrder
  } else if (target === null) {
    throw new Error('`target` cannot be null if `bounding` is not null')
  }
  if (bounding === null) {
    return target.sortOrder + (SORT_STEP + dndNoise()) * (before ? 1 : -1)
  }
  return toInsert && toInsert.id === bounding.id
    ? bounding.sortOrder
    : (bounding.sortOrder + target.sortOrder) / 2 + dndNoise()
}
