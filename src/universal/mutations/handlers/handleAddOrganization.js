import {insertNodeBefore} from 'universal/utils/relay/insertEdge';

const handleAddOrganization = (newNode, store, viewerId) => {
  const viewer = store.get(viewerId);
  const organizations = viewer.getLinkedRecords('organizations');
  if (organizations) {
    const newNodes = insertNodeBefore(organizations, newNode, 'name');
    viewer.setLinkedRecords(newNodes, 'organizations');
  }
};

export default handleAddOrganization;
