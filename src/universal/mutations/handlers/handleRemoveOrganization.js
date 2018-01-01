import safeRemoveNodeFromArray from 'universal/utils/relay/safeRemoveNodeFromArray';

const handleRemoveOrganization = (newNode, store, viewerId) => {
  const viewer = store.get(viewerId);
  safeRemoveNodeFromArray(newNode, viewer, 'organizations');
};

export default handleRemoveOrganization;
