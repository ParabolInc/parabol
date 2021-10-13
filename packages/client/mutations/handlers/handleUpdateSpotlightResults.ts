import safeRemoveNodeFromArray from '~/utils/relay/safeRemoveNodeFromArray'
import {RecordProxy, RecordSourceSelectorProxy} from 'relay-runtime'
import getNextSortOrder from '~/utils/getNextSortOrder'
import addNodeToArray from '~/utils/relay/addNodeToArray'

type ColumnCounts = {
  [index: number]: number
}

const getEmptiestColumnIdx = (
  similarReflectionGroups: RecordProxy[],
  spotlightColumnsCount?: number
) => {
  const columnCounts = {} as ColumnCounts
  if (spotlightColumnsCount) {
    const columnsArr = [...Array(spotlightColumnsCount).keys()]
    columnsArr.forEach((column) => (columnCounts[column] = 0))
  }
  for (const group of similarReflectionGroups) {
    const spotlightColumnIdx = group.getValue('spotlightColumnIdx') as number
    if (spotlightColumnIdx === undefined) continue
    if (columnCounts[spotlightColumnIdx] !== undefined) {
      columnCounts[spotlightColumnIdx] += 1
    } else {
      columnCounts[spotlightColumnIdx] = 1
    }
  }
  const columnLengths = Object.values(columnCounts)
  const emptiestColumn = Math.min(...columnLengths)
  return columnLengths.indexOf(emptiestColumn)
}

// if a remote user groups/ungroups a result, a reflectionGroupId is created or removed
// update the similarReflectionGroup to reflect this
const handleUpdateSpotlightResults = (
  reflection: RecordProxy,
  reflectionGroup: RecordProxy | null,
  oldReflectionGroupId: string,
  store: RecordSourceSelectorProxy
) => {
  const meetingId = reflection.getValue('meetingId') as string
  const meeting = store.get(meetingId)
  // reflectionGroup is null if there's no target type
  if (!meeting || !reflectionGroup) return
  const spotlightReflection = meeting?.getLinkedRecord('spotlightReflection')
  const spotlightReflectionId = spotlightReflection?.getValue('id')
  const viewer = store.getRoot().getLinkedRecord('viewer')
  if (!viewer || !spotlightReflectionId) return
  const similarReflectionGroups = viewer.getLinkedRecords('similarReflectionGroups', {
    reflectionId: spotlightReflectionId,
    searchQuery: '' // TODO: add search query
  })
  console.log('Add searchQuery')
  if (!similarReflectionGroups) return
  const reflectionsCount = reflectionGroup?.getLinkedRecords('reflections')?.length
  const oldReflections = store.get(oldReflectionGroupId)?.getLinkedRecords('reflections')
  const reflectionId = reflection.getValue('id')
  const isStaleGroup =
    oldReflections?.length === 1 && oldReflections[0].getValue('id') === reflectionId
  // added to an existing group. old reflection group needs to be removed
  if (isStaleGroup) {
    safeRemoveNodeFromArray(oldReflectionGroupId, viewer, 'similarReflectionGroups', {
      storageKeyArgs: {
        reflectionId: spotlightReflectionId,
        searchQuery: '' // TODO: add search query
      }
    })
  }
  // ungrouping created a new group id which needs to be added to Spotlight
  else if (reflectionsCount === 1) {
    const sortOrders = similarReflectionGroups.map((group) => ({
      sortOrder: group.getValue('sortOrder') as number
    }))
    const nextSortOrder = getNextSortOrder(sortOrders)
    reflectionGroup.setValue(nextSortOrder, 'sortOrder')
    const maxSpotlightColumns = viewer.getValue('maxSpotlightColumns') as number
    const emptiestColumnIdx = getEmptiestColumnIdx(similarReflectionGroups, maxSpotlightColumns)
    reflectionGroup.setValue(emptiestColumnIdx, 'spotlightColumnIdx')
    addNodeToArray(reflectionGroup, viewer, 'similarReflectionGroups', 'sortOrder', {
      storageKeyArgs: {
        reflectionId: spotlightReflectionId,
        searchQuery: '' // TODO: add search query
      }
    })
  }
}

export default handleUpdateSpotlightResults
