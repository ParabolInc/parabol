import addNodeToArray from 'universal/utils/relay/addNodeToArray';

const handleAddOrganization = (newNode, store, viewerId) => {
  const viewer = store.get(viewerId);
  addNodeToArray(newNode, viewer, 'organizations', 'name');
};

export default handleAddOrganization;
