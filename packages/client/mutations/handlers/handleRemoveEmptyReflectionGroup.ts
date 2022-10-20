import {RecordSourceSelectorProxy} from 'relay-runtime'
import handleRemoveReflectionGroups from './handleRemoveReflectionGroups'

const handleRemoveEmptyReflectionGroup = (
  reflectionGroupId: string,
  store: RecordSourceSelectorProxy
) => {
  const reflectionGroup = store.get(reflectionGroupId)
  if (!reflectionGroup) return
  const reflections = reflectionGroup.getLinkedRecords('reflections')
  if (!reflections || reflections.length > 0) return
  const meetingId = reflectionGroup.getValue('meetingId') as string
  handleRemoveReflectionGroups(reflectionGroupId, meetingId, store)
}

export default handleRemoveEmptyReflectionGroup
