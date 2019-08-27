import addNodeToArray from '../../utils/relay/addNodeToArray'
import {RecordProxy, RecordSourceSelectorProxy} from 'relay-runtime'

const handleAddReflectionToGroup = (reflectionProxy: RecordProxy, store: RecordSourceSelectorProxy) => {
  if (!reflectionProxy) return
  const reflectionGroupId = reflectionProxy.getValue('reflectionGroupId')
  const reflectionGroupProxy = store.get(reflectionGroupId)
  addNodeToArray(reflectionProxy, reflectionGroupProxy, 'reflections', 'sortOrder')
}

export default handleAddReflectionToGroup
