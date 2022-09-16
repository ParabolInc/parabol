import {RecordProxy, RecordSourceSelectorProxy} from 'relay-runtime'
import addNodeToArray from '../../utils/relay/addNodeToArray'
import pluralizeHandler from './pluralizeHandler'

const handleAddReflectionGroup = (
  reflectionGroup: RecordProxy<{meetingId: string}>,
  store: RecordSourceSelectorProxy
) => {
  const meetingId = reflectionGroup.getValue('meetingId')
  const meeting = store.get(meetingId)
  addNodeToArray(reflectionGroup, meeting, 'reflectionGroups', 'sortOrder')
}

const handleAddReflectionGroups = pluralizeHandler(handleAddReflectionGroup)
export default handleAddReflectionGroups
