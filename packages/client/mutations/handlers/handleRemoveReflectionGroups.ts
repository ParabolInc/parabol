import {RecordSourceSelectorProxy} from 'relay-runtime'
import safeRemoveNodeFromArray from '../../utils/relay/safeRemoveNodeFromArray'
import pluralizeHandler from './pluralizeHandler'

const handleRemoveReflectionGroup = (
  reflectionGroupId: string,
  meetingId: string,
  store: RecordSourceSelectorProxy
) => {
  const reflectionGroup = store.get(reflectionGroupId)
  if (!reflectionGroup) return
  const meeting = store.get(meetingId)
  if (!meeting) return
  safeRemoveNodeFromArray(reflectionGroupId, meeting, 'reflectionGroups')
}

const handleRemoveReflectionGroups = pluralizeHandler(handleRemoveReflectionGroup)
export default handleRemoveReflectionGroups
