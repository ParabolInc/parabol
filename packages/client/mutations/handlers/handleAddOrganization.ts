import {RecordProxy, RecordSourceSelectorProxy} from 'relay-runtime'
import addNodeToArray from '../../utils/relay/addNodeToArray'

const handleAddOrganization = (newNode: RecordProxy, store: RecordSourceSelectorProxy) => {
  const viewer = store.getRoot().getLinkedRecord('viewer')
  addNodeToArray(newNode, viewer, 'organizations', 'name')
}

export default handleAddOrganization
