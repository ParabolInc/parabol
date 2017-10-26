// import storeDebugger from 'relay-runtime/lib/RelayStoreProxyDebugger';
import {
  removeIntegrations, removeProviderUpdater, removeUserFromIntegrations,
  updateProviderMap
} from 'universal/mutations/RemoveProviderMutation';

const subscription = graphql`
  subscription ProviderRemovedSubscription($teamId: ID!) {
    providerRemoved(teamId: $teamId) {
      providerRow {
        service
        accessToken
        userCount
        integrationCount
      }
      deletedIntegrationIds
      userId
    }
  }
`;

const ProviderRemovedSubscription = (environment, queryVariables) => {
  const {viewerId} = environment;
  const {teamId} = queryVariables;
  return {
    subscription,
    variables: {teamId},
    updater: (store) => {
      const viewer = store.get(viewerId);
      const payload = store.getRootField('providerRemoved');
      const service = payload.getLinkedRecord('providerRow').getValue('service');

      // remove the accessToken from the provider
      const userId = payload.getValue('userId');
      removeProviderUpdater(viewer, teamId, service, userId);

      // update the userCount & integrationCount (and access token if mutator == viewer)
      updateProviderMap(viewer, teamId, service, payload);

      // update the integrations that exclusively belonged to this provider
      const deletedIntegrationIds = payload.getValue('deletedIntegrationIds');
      removeIntegrations(viewer, teamId, service, deletedIntegrationIds);

      removeUserFromIntegrations(viewer, teamId, service, userId);
    }
  };
};

export default ProviderRemovedSubscription;
