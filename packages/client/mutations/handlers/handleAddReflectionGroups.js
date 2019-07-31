import pluralizeHandler from './pluralizeHandler'
import addNodeToArray from '../../utils/relay/addNodeToArray'

const handleAddReflectionGroup = (reflectionGroup, store) => {
  const meetingId = reflectionGroup.getValue('meetingId')
  const meeting = store.get(meetingId)
  addNodeToArray(reflectionGroup, meeting, 'reflectionGroups', 'sortOrder')
}

const handleAddReflectionGroups = pluralizeHandler(handleAddReflectionGroup)
export default handleAddReflectionGroups
