// import storeDebugger from 'relay-runtime/lib/RelayStoreProxyDebugger';
import {removeProviderUpdater} from 'universal/mutations/RemoveProviderMutation';
import {SLACK} from 'universal/utils/constants';

const subscription = graphql`
  subscription ProviderRemovedSubscription($teamId: ID!) {
    providerRemoved(teamId: $teamId) {
      providerRow {
        service
        accessToken
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

      // remove the integrations that depend on this provider
      if (service === SLACK) {
        viewer.setLinkedRecords([], 'slackChannels', {teamId});
      }
    }
  });
};

export default ProviderRemovedSubscription;
