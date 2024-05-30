import {RecordProxy} from 'relay-runtime'
import dndNoise from '../dndNoise'

const computeNewSortOrder = (
  reflectionGroupsInColumn: RecordProxy[],
  reflection: RecordProxy,
  oldReflectionGroup: RecordProxy
) => {
  let newSortOrder = 1e6
  const oldReflectionGroupIdx = reflectionGroupsInColumn.findIndex(
    (group) => group.getDataID() === oldReflectionGroup.getDataID()
  )
  const sortOrderAtBottom =
    ((reflectionGroupsInColumn[reflectionGroupsInColumn.length - 1]?.getValue(
      'sortOrder'
    ) as number) ?? 1e6) +
    1 +
    dndNoise()
  if (
    oldReflectionGroupIdx === -1 ||
    reflection.getValue('promptId') !== oldReflectionGroup.getValue('promptId')
  ) {
    newSortOrder = sortOrderAtBottom
  } else if (oldReflectionGroupIdx === reflectionGroupsInColumn.length - 1) {
    newSortOrder = (oldReflectionGroup.getValue('sortOrder') as number) + 1 + dndNoise()
  } else {
    const oldSortOrder = oldReflectionGroup.getValue('sortOrder') as number
    const afterSortOrder =
      (reflectionGroupsInColumn[oldReflectionGroupIdx + 1]?.getValue('sortOrder') as number) ?? 0
    newSortOrder = (oldSortOrder + afterSortOrder) / 2 + dndNoise()
  }
  return newSortOrder
}

export default computeNewSortOrder
