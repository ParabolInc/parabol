// import {updateProviderMapUpdater} from 'universal/mutations/RemoveProviderMutation';

const subscription = graphql`
  subscription ProviderAddedSubscription($teamId: ID!) {
    providerAdded(teamId: $teamId) {
      providerRow {
        service
        accessToken
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
  const service = newIntegrationProvider.getValue('service');
  const oldIntegrationProvider = viewer.getLinkedRecord('integrationProvider', {teamId, service});
  if (oldIntegrationProvider) {
    oldIntegrationProvider.copyFieldsFrom(newIntegrationProvider);
  } else {
    viewer.setLinkedRecord(newIntegrationProvider, 'integrationProvider', {teamId, service});
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
