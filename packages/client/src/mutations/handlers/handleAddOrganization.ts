import addNodeToArray from '../../utils/relay/addNodeToArray'

const handleAddOrganization = (newNode, store) => {
  const viewer = store.getRoot().getLinkedRecord('viewer')
  addNodeToArray(newNode, viewer, 'organizations', 'name')
}

export default handleAddOrganization
