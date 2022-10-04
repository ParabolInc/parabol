import {RecordProxy, RecordSourceSelectorProxy} from 'relay-runtime'
import addNodeToArray from '~/utils/relay/addNodeToArray'
import safeRemoveNodeFromArray from '~/utils/relay/safeRemoveNodeFromArray'

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
  const spotlightSearchQuery = (meeting.getValue('spotlightSearchQuery') || '') as string
  const spotlightGroup = meeting?.getLinkedRecord('spotlightGroup')
  const spotlightGroupId = spotlightGroup?.getValue('id')
  const viewer = store.getRoot().getLinkedRecord('viewer')
  if (!viewer || !spotlightGroupId) return
  const similarReflectionGroups = viewer.getLinkedRecords('similarReflectionGroups', {
    reflectionGroupId: spotlightGroupId,
    searchQuery: spotlightSearchQuery
  })
  if (!similarReflectionGroups) return
  const reflectionsCount = reflectionGroup?.getLinkedRecords('reflections')?.length
  const oldReflectionGroup = store.get(oldReflectionGroupId)
  const oldReflections = oldReflectionGroup?.getLinkedRecords('reflections')
  const reflectionId = reflection.getValue('id')
  const isOldGroupEmpty =
    oldReflections?.length === 1 && oldReflections[0]!.getValue('id') === reflectionId
  const reflectionGroupId = reflectionGroup.getValue('id')
  const groupsIds = similarReflectionGroups
    .map((group) => group.getValue('id'))
    .concat(spotlightGroupId)
  const isInSpotlight = groupsIds.includes(reflectionGroupId)
  const wasInSpotlight = groupsIds.includes(oldReflectionGroupId)
  // added to another group. Remove old reflection group
  if (isOldGroupEmpty && wasInSpotlight) {
    safeRemoveNodeFromArray(oldReflectionGroupId, viewer, 'similarReflectionGroups', {
      storageKeyArgs: {
        reflectionGroupId: spotlightGroupId,
        searchQuery: spotlightSearchQuery
      }
    })
  }
  // ungrouping created a new group or was added to a group in the kanban
  // reflectionsCount is undefined when ungrouping
  // don't use else if: when a result is added to a kanban group, remove old empty group and add new one
  if (!isInSpotlight && reflectionsCount !== undefined && wasInSpotlight) {
    addNodeToArray(reflectionGroup, viewer, 'similarReflectionGroups', 'sortOrder', {
      storageKeyArgs: {
        reflectionGroupId: spotlightGroupId,
        searchQuery: spotlightSearchQuery
      }
    })
  }
}

export default handleUpdateSpotlightResults
