const incrementIntegrationCount = (viewer, teamId, service, amount) => {
  // update the providerMap
  const oldProviderMap = viewer.getLinkedRecord('providerMap', {teamId});
  if (oldProviderMap) {
    const oldProviderRow = oldProviderMap.getLinkedRecord(service);
    oldProviderRow.setValue(oldProviderRow.getValue('integrationCount') + amount, 'integrationCount');
  }
};

export default incrementIntegrationCount;
