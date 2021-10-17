import safeRemoveNodeFromArray from '~/utils/relay/safeRemoveNodeFromArray'
import {RecordProxy, RecordSourceSelectorProxy} from 'relay-runtime'
import addNodeToArray from '~/utils/relay/addNodeToArray'

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
    safeRemoveNodeFromArray(oldReflectionGroupId, viewer, 'similarReflectionGroups', {
      storageKeyArgs: {
        reflectionId: spotlightReflectionId,
        searchQuery: '' // TODO: add search query
      }
    })
    // reflectionGroup.setValue(oldSortOrder, 'sortOrder')
    addNodeToArray(reflectionGroup, viewer, 'similarReflectionGroups', 'sortOrder', {
      storageKeyArgs: {
        reflectionId: spotlightReflectionId,
        searchQuery: '' // TODO: add search query
      }
    })
  }
  // ungrouping in the Spotlight created a new group
  else if (reflectionsCount === 1) {
    addNodeToArray(reflectionGroup, viewer, 'similarReflectionGroups', 'sortOrder', {
      storageKeyArgs: {
        reflectionId: spotlightReflectionId,
        searchQuery: '' // TODO: add search query
      }
    })
  }
}

export default handleUpdateSpotlightResults
