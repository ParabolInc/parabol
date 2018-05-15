import pluralizeHandler from 'universal/mutations/handlers/pluralizeHandler'
import addNodeToArray from 'universal/utils/relay/addNodeToArray'

const handleAddReflectionGroup = (reflectionGroup, store) => {
  const meetingId = reflectionGroup.getValue('meetingId')
  const meeting = store.get(meetingId)
  addNodeToArray(reflectionGroup, meeting, 'reflectionGroups', 'sortOrder')
}

const handleAddReflectionGroups = pluralizeHandler(handleAddReflectionGroup)
export default handleAddReflectionGroups
