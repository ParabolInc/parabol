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
  const spotlightGroup = meeting?.getLinkedRecord('spotlightGroup')
  const spotlightGroupId = spotlightGroup?.getValue('id')
  const viewer = store.getRoot().getLinkedRecord('viewer')
  if (!viewer || !spotlightGroupId) return
  const similarReflectionGroups = viewer.getLinkedRecords('similarReflectionGroups', {
    reflectionGroupId: spotlightGroupId,
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
  const isInSpotlight = [...groupsIds, spotlightGroupId].includes(reflectionGroupId)
  const wasInSpotlight = [...groupsIds, spotlightGroupId].includes(oldReflectionGroupId)
  // added to another group. Remove old reflection group
  if (isOldGroupEmpty) {
    safeRemoveNodeFromArray(oldReflectionGroupId, viewer, 'similarReflectionGroups', {
      storageKeyArgs: {
        reflectionGroupId: spotlightGroupId,
        searchQuery: '' // TODO: add search query
      }
    })
  }
  // ungrouping created a new group or added to a group in the kanban
  if ((reflectionsCount === 1 && wasInSpotlight) || (isOldGroupEmpty && !isInSpotlight)) {
    addNodeToArray(reflectionGroup, viewer, 'similarReflectionGroups', 'sortOrder', {
      storageKeyArgs: {
        reflectionGroupId: spotlightGroupId,
        searchQuery: '' // TODO: add search query
      }
    })
  }
}

export default handleUpdateSpotlightResults
