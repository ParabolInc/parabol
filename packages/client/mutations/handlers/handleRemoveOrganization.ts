import {RecordSourceSelectorProxy} from 'relay-runtime'
import safeRemoveNodeFromArray from '../../utils/relay/safeRemoveNodeFromArray'

const handleRemoveOrganization = (orgId: string, store: RecordSourceSelectorProxy) => {
  const viewer = store.getRoot().getLinkedRecord('viewer')!
  safeRemoveNodeFromArray(orgId, viewer, 'organizations')
}

export default handleRemoveOrganization
