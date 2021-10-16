import safeRemoveNodeFromArray from '~/utils/relay/safeRemoveNodeFromArray'
import {RecordProxy, RecordSourceSelectorProxy} from 'relay-runtime'
import getNextSortOrder from '~/utils/getNextSortOrder'
import addNodeToArray from '~/utils/relay/addNodeToArray'

const getEmptiestColumnIdx = (refGroups: RecordProxy[]) => {
  const counts: number[] = refGroups.reduce((arr: number[], group: RecordProxy) => {
    const val = group.getValue('spotlightColumnIdx') as number
    arr[val] = arr[val] || 0
    arr[val]++
    return arr
  }, [])
  const minVal = Math.min(...counts)
  return counts.indexOf(minVal)
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
    const emptiestColumnIdx = getEmptiestColumnIdx(similarReflectionGroups)
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
