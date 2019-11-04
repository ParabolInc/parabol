import addNodeToArray from '../../utils/relay/addNodeToArray'
import {RecordProxy, RecordSourceSelectorProxy} from 'relay-runtime'

const handleAddReflectionToGroup = (
  reflectionProxy: RecordProxy,
  store: RecordSourceSelectorProxy
) => {
  if (!reflectionProxy) return
  const reflectionGroupId = reflectionProxy.getValue('reflectionGroupId') as string
  const reflectionGroupProxy = store.get(reflectionGroupId)
  addNodeToArray(reflectionProxy, reflectionGroupProxy, 'reflections', 'sortOrder', {
    descending: true
  })
}

export default handleAddReflectionToGroup
