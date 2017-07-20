// import {updateProviderMapUpdater} from 'universal/mutations/RemoveProviderMutation';

const subscription = graphql`
  subscription ProviderAddedSubscription($teamId: ID!) {
    providerAdded(teamId: $teamId) {
      providerRow {
        service
        accessToken
        userCount
        integrationCount
      }
      provider {
        id
        accessToken
        service
      }

    }
  }
`;

const addProviderUpdater = (viewer, teamId, payload) => {
  const newIntegrationProvider = payload.getLinkedRecord('provider');
  const newProviderRow = payload.getLinkedRecord('providerRow');
  const service = newProviderRow.getValue('service');

  const oldProviderMap = viewer.getLinkedRecord('providerMap', {teamId});
  if (newIntegrationProvider) {
    viewer.setLinkedRecord(newIntegrationProvider, 'integrationProvider', {teamId, service});
  } else if (oldProviderMap) {
    // if there is no provider, then the mutation was not caused by the viewer, so ignore the accessToken change
    const oldProviderRow = oldProviderMap.getLinkedRecord(service);
    newProviderRow.setValue(oldProviderRow.getValue('accessToken'), 'accessToken');
  }
  if (oldProviderMap) {
    oldProviderMap.getLinkedRecord(service).copyFieldsFrom(newProviderRow);
  }
};

const ProviderAddedSubscription = (teamId, viewerId) => (ensureSubscription) => {
  return ensureSubscription({
    subscription,
    variables: {teamId},
    updater: (store) => {
      const payload = store.getRootField('providerAdded');
      const viewer = store.get(viewerId);
      addProviderUpdater(viewer, teamId, payload);
    }
  });
};

export default ProviderAddedSubscription;
