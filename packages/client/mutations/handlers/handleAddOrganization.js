import addNodeToArray from '../../utils/relay/addNodeToArray'

const handleAddOrganization = (newNode, store, viewerId) => {
  const viewer = store.get(viewerId)
  addNodeToArray(newNode, viewer, 'organizations', 'name')
}

export default handleAddOrganization
