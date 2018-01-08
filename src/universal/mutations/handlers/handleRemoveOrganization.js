import safeRemoveNodeFromArray from 'universal/utils/relay/safeRemoveNodeFromArray';

const handleRemoveOrganization = (orgId, store, viewerId) => {
  const viewer = store.get(viewerId);
  safeRemoveNodeFromArray(orgId, viewer, 'organizations');
};

export default handleRemoveOrganization;
