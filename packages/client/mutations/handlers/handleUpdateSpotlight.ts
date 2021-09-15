import safeRemoveNodeFromArray from '~/utils/relay/safeRemoveNodeFromArray'
import {RecordProxy, RecordSourceSelectorProxy} from 'relay-runtime'
import getNextSortOrder from '~/utils/getNextSortOrder'
import addNodeToArray from '~/utils/relay/addNodeToArray'

const getEmptiestColumnIdx = (similarReflectionGroups: RecordProxy[]) => {
  type ColumnCounts = {
    [index: number]: number
  }
  const columnCounts = {} as ColumnCounts
  for (const group of similarReflectionGroups) {
    const spotlightColumnIdx = group.getValue('spotlightColumnIdx') as number
    if (spotlightColumnIdx === undefined) continue
    if (columnCounts[spotlightColumnIdx]) {
      columnCounts[spotlightColumnIdx] += 1
    } else {
      columnCounts[spotlightColumnIdx] = 1
    }
  }
  const columnLengths = Object.values(columnCounts)
  const emptiestColumn = Math.min(...columnLengths)
  const emptiestColumnIdx = columnLengths.indexOf(emptiestColumn)
  return emptiestColumnIdx
}

const handleUpdateSpotlight = (
  reflection: RecordProxy,
  reflectionGroup: RecordProxy,
  oldReflectionGroupId: string,
  store: RecordSourceSelectorProxy
) => {
  const reflectionGroupId = reflection.getValue('reflectionGroupId')
  const reflectionId = reflection.getValue('id')
  if (reflectionGroupId === oldReflectionGroupId) return
  const meetingId = reflection.getValue('meetingId') as string
  const meeting = store.get(meetingId)
  if (!meeting) return
  const spotlightReflection = meeting?.getLinkedRecord('spotlightReflection')
  const spotlightReflectionId = spotlightReflection?.getValue('id')
  const viewer = store.getRoot().getLinkedRecord('viewer')
  if (!viewer || !spotlightReflectionId) return
  const similarReflectionGroups = viewer.getLinkedRecords('similarReflectionGroups', {
    reflectionId: spotlightReflectionId,
    searchQuery: ''
  })
  if (!similarReflectionGroups) return
  const wasInSpotlightGroups = similarReflectionGroups.find(
    (group) => group.getValue('id') === oldReflectionGroupId
  )
  const isInSpotlightGroups = similarReflectionGroups.find(
    (group) => group.getValue('id') === reflectionGroupId
  )
  // was added to a new group and needs to be removed
  if (isInSpotlightGroups && wasInSpotlightGroups) {
    const removedReflectionGroup = store.get(oldReflectionGroupId)
    // make sure the old group is empty
    const oldReflections = removedReflectionGroup?.getLinkedRecords('reflections')
    const oldReflectionIds = oldReflections?.map((reflection) => reflection.getValue('id'))
    if (oldReflectionIds?.length === 1 && oldReflectionIds[0] === reflectionId) {
      safeRemoveNodeFromArray(oldReflectionGroupId, viewer, 'similarReflectionGroups', {
        storageKeyArgs: {
          reflectionId: spotlightReflectionId,
          searchQuery: ''
        }
      })
    }
  }
  // was ungrouped, created a new group id and needs to be added to Spotlight
  else if (!isInSpotlightGroups && wasInSpotlightGroups) {
    const sortOrders = similarReflectionGroups.map((group) => ({
      sortOrder: group.getValue('sortOrder') as number
    }))
    const nextSortOrder = getNextSortOrder(sortOrders)
    reflectionGroup.setValue(nextSortOrder, 'sortOrder')
    const emptiestColumnIdx = getEmptiestColumnIdx(similarReflectionGroups)
    reflectionGroup.setValue(emptiestColumnIdx, 'spotlightColumnIdx')
    addNodeToArray(reflectionGroup, viewer, 'similarReflectionGroups', 'sortOrder', {
      storageKeyArgs: {
        reflectionId: spotlightReflectionId,
        searchQuery: ''
      }
    })
  }
}

export default handleUpdateSpotlight
