import addNodeToArray from '../../utils/relay/addNodeToArray'
import pluralizeHandler from './pluralizeHandler'

const handleAddReflectionGroup = (reflectionGroup, store) => {
  const meetingId = reflectionGroup.getValue('meetingId')
  const meeting = store.get(meetingId)
  addNodeToArray(reflectionGroup, meeting, 'reflectionGroups', 'sortOrder')
}

const handleAddReflectionGroups = pluralizeHandler(handleAddReflectionGroup)
export default handleAddReflectionGroups
