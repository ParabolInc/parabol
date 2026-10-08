import {Threshold} from '../types/constEnums'
import plural from './plural'

const getSelectAllTitle = (
  unusedStoryCount: number,
  usedServiceTaskIdCount: number,
  storyLabel: string,
  allSelected: boolean | null
) => {
  if (allSelected) return 'Deselect all'
  const availableCountToAdd = Threshold.MAX_POKER_STORIES - usedServiceTaskIdCount
  const selectableCount = Math.min(availableCountToAdd, unusedStoryCount)
  const adjective = selectableCount === unusedStoryCount ? 'all' : 'next'
  return `Select ${adjective} ${selectableCount} ${plural(selectableCount, storyLabel)}`
}

export default getSelectAllTitle
