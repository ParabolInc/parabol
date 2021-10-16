import safeRemoveNodeFromArray from '~/utils/relay/safeRemoveNodeFromArray'
import {RecordProxy, RecordSourceSelectorProxy} from 'relay-runtime'
import getNextSortOrder from '~/utils/getNextSortOrder'
import addNodeToArray from '~/utils/relay/addNodeToArray'

const getEmptiestColumnIdx = (refGroups: RecordProxy[]) => {
  const counts: number[] = refGroups.reduce((arr: number[], group: RecordProxy) => {
    const idx = group.getValue('spotlightColumnIdx') as number
    arr[idx] = arr[idx] || 0
    arr[idx]++
    return arr
  }, [])
  const minVal = Math.min(...counts)
  return counts.indexOf(minVal)
}

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
  if (!similarReflectionGroups) return
  const reflectionsCount = reflectionGroup?.getLinkedRecords('reflections')?.length
  const oldReflectionGroup = store.get(oldReflectionGroupId)
  const oldReflections = oldReflectionGroup?.getLinkedRecords('reflections')
  const reflectionId = reflection.getValue('id')
  const isOldGroupEmpty =
    oldReflections?.length === 1 && oldReflections[0].getValue('id') === reflectionId
  const reflectionGroupId = reflectionGroup.getValue('id')
  const groupsIds = similarReflectionGroups.map((group) => group.getValue('id'))
  const isNewGroupInSpotlight = groupsIds.includes(reflectionGroupId)
  // added to a group in the spotlight. remove old reflection group
  if (isOldGroupEmpty && isNewGroupInSpotlight) {
    safeRemoveNodeFromArray(oldReflectionGroupId, viewer, 'similarReflectionGroups', {
      storageKeyArgs: {
        reflectionId: spotlightReflectionId,
        searchQuery: '' // TODO: add search query
      }
    })
  }
  // added to a group that doesn't exist in the Spotlight. remove old group & add new one
  else if (isOldGroupEmpty && !isNewGroupInSpotlight) {
    const oldSortOrder = oldReflectionGroup?.getValue('sortOrder')
    const oldColumnIdx = oldReflectionGroup?.getValue('spotlightColumnIdx')
    safeRemoveNodeFromArray(oldReflectionGroupId, viewer, 'similarReflectionGroups', {
      storageKeyArgs: {
        reflectionId: spotlightReflectionId,
        searchQuery: '' // TODO: add search query
      }
    })
    reflectionGroup.setValue(oldSortOrder, 'sortOrder')
    reflectionGroup.setValue(oldColumnIdx, 'spotlightColumnIdx')
    addNodeToArray(reflectionGroup, viewer, 'similarReflectionGroups', 'sortOrder', {
      storageKeyArgs: {
        reflectionId: spotlightReflectionId,
        searchQuery: '' // TODO: add search query
      }
    })
  }
  // ungrouping in the Spotlight created a new group
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
