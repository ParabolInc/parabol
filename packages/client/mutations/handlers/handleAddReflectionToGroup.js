import addNodeToArray from '../../utils/relay/addNodeToArray'

const handleAddReflectionToGroup = (reflectionProxy, store) => {
  if (!reflectionProxy) return
  const reflectionGroupId = reflectionProxy.getValue('reflectionGroupId')
  const reflectionGroupProxy = store.get(reflectionGroupId)
  addNodeToArray(reflectionProxy, reflectionGroupProxy, 'reflections', 'sortOrder')
}

export default handleAddReflectionToGroup
