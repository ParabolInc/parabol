import relayEnv from 'client/relayEnv';
import {ConnectionHandler} from 'relay-runtime';
//import storeDebugger from 'relay-runtime/lib/RelayStoreProxyDebugger';


const mutation = graphql`
  mutation removeSlackChannelMutation($input: RemoveSlackChannelInput!) {
    removeSlackChannel(input: $input) {
      deletedIntegrationId
    }
  }
`;

export const removeSlackChannelUpdater = (store, viewerId, teamId, deletedId) => {
  const conn = ConnectionHandler.getConnection(
    store.get(viewerId),
    'SlackIntegrations_slackChannels',
    {
      teamId
    }
  );
  ConnectionHandler.deleteNode(conn, deletedId);
};

const removeSlackChannelMutation = (slackGlobalId, teamId, viewerId) => {
  return relayEnv.mutate({
    mutation,
    variables: {
      input: {
        slackGlobalId
      }
    },
    updater: (store) => {
      const payload = store.getRootField('removeSlackChannel');
      const deletedId = payload.getValue('deletedIntegrationId');
      removeSlackChannelUpdater(store, viewerId, teamId, deletedId);
    },
    optimisticUpdater: (store) => {
      removeSlackChannelUpdater(store, viewerId, teamId, slackGlobalId);
    },
    onError: (err) => {
      console.log('err', err)
    }
  })
};

export default removeSlackChannelMutation;