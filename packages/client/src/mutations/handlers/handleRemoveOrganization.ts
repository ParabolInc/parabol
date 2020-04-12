import safeRemoveNodeFromArray from '../../utils/relay/safeRemoveNodeFromArray'

const handleRemoveOrganization = (orgId, store) => {
  const viewer = store.getRoot().getLinkedRecord('viewer')
  safeRemoveNodeFromArray(orgId, viewer, 'organizations')
}

export default handleRemoveOrganization
