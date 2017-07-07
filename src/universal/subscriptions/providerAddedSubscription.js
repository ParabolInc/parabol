import relayEnv from 'client/relayEnv';
//import storeDebugger from 'relay-runtime/lib/RelayStoreProxyDebugger';
import {CURRENT_PROVIDERS} from 'universal/utils/constants';

const teamIntegrationsSubscription = graphql`
  subscription providerAddedSubscription($teamId: ID!) {
    providerAdded(teamId: $teamId) {
      github {
        accessToken
      }
      slack {
        accessToken
      }
    }
  }
`;

const providerAddedSubscription = (teamMemberId, viewerId) => {
  const [, teamId] = teamMemberId.split('::');
  return relayEnv.ensureSubscription({
    subscription: teamIntegrationsSubscription,
    variables: {teamId},
    updater: (store) => {
      const newDataPayload = store.getRootField('providerAdded');
      let newProviderObject;
      let provider;
      for (let i = 0; i < CURRENT_PROVIDERS.length; i++) {
        provider = CURRENT_PROVIDERS[i];
        newProviderObject = newDataPayload.getLinkedRecord(provider);
        if (newProviderObject) break;
      }
      if (!provider) {
        throw new Error('Unknown provider sent from subscription', newDataPayload);
      }
      const viewer = store.get(viewerId);
      const providerMap = viewer.getLinkedRecord('providerMap', {teamMemberId});
      const oldProvider = providerMap.getLinkedRecord(provider);
      if (oldProvider) {
        // TODO Test by making the mutation send a payload with fewer fields than the original request
        oldProvider.copyFieldsFrom(newProviderObject);
      } else {
        providerMap.setLinkedRecord(newProviderObject, provider);
      }
      //
    }
  })
};

export default providerAddedSubscription;