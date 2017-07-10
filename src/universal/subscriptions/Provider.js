//import storeDebugger from 'relay-runtime/lib/RelayStoreProxyDebugger';

const subscription = graphql`
  subscription ProviderSubscription($teamId: ID!) {
    providerUpdated(teamId: $teamId) {
      service
      accessToken
    }
  }
`;

const Provider = (teamMemberId, viewerId) => (ensureSubscription) => {
  const [, teamId] = teamMemberId.split('::');
  return ensureSubscription({
    subscription,
    variables: {teamId},
    updater: (store) => {
      const newProviderRow = store.getRootField('providerUpdated');
      const service = newProviderRow.getValue('service');
      const viewer = store.get(viewerId);
      const providerMap = viewer.getLinkedRecord('providerMap', {teamMemberId});
      const oldProviderRow = providerMap.getLinkedRecord(service);
      if (oldProviderRow) {
        // TODO Test by making the mutation send a payload with fewer fields than the original request
        oldProviderRow.copyFieldsFrom(newProviderRow);
      } else {
        providerMap.setLinkedRecord(newProviderRow, service);
      }
      //
    }
  })
};

export default Provider;
