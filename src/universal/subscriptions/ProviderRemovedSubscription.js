// import storeDebugger from 'relay-runtime/lib/RelayStoreProxyDebugger';
import {removeIntegrations, removeProviderUpdater, updateProviderMap} from 'universal/mutations/RemoveProviderMutation';
import {SLACK} from 'universal/utils/constants';

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
    }
  }
`;

const ProviderRemovedSubscription = (teamId, viewerId) => (ensureSubscription) => {
  return ensureSubscription({
    subscription,
    variables: {teamId},
    updater: (store) => {
      const viewer = store.get(viewerId);
      const payload = store.getRootField('providerRemoved');
      const service = payload.getLinkedRecord('providerRow').getValue('service');

      // remove the accessToken from the provider
      removeProviderUpdater(viewer, teamId, service);

      // update the userCount & integrationCount (and access token if mutator == viewer)
      updateProviderMap(viewer, teamId, service, payload);

      // update the integrations that exclusively belonged to this provider
      const deletedIntegrationIds = payload.getValue('deletedIntegrationIds');
      removeIntegrations(viewer, teamId, service, deletedIntegrationIds);
    }
  });
};

export default ProviderRemovedSubscription;
