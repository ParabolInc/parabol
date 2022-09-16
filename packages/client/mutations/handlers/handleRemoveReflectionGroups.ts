import safeRemoveNodeFromArray from '../../utils/relay/safeRemoveNodeFromArray'
import pluralizeHandler from './pluralizeHandler'

const handleRemoveReflectionGroup = (reflectionGroupId, meetingId, store) => {
  const reflectionGroup = store.get(reflectionGroupId)
  if (!reflectionGroup) return
  const meeting = store.get(meetingId)
  if (!meeting) return
  safeRemoveNodeFromArray(reflectionGroupId, meeting, 'reflectionGroups')
}

const handleRemoveReflectionGroups = pluralizeHandler(handleRemoveReflectionGroup)
export default handleRemoveReflectionGroups
