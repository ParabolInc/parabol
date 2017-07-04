import relayEnv from 'client/relayEnv';
import {commitMutation} from 'react-relay';
import {ConnectionHandler} from 'relay-runtime';
//import storeDebugger from 'relay-runtime/lib/RelayStoreProxyDebugger';

const mutation = graphql`
  mutation addSlackChannelMutation($input: AddSlackChannelInput!) {
    addSlackChannel(input: $input) {
      newChannel {
        node {
          channelId
          channelName
        }
      }
    }
  }
`;
let tempId = 0;

const sharedUpdater = (store, viewerId, teamId, newEdge) => {
  const conn = ConnectionHandler.getConnection(
    store.get(viewerId),
    'SlackIntegrations_slackChannels',
    {
      teamId
    }
  );
  ConnectionHandler.insertEdgeBefore(conn, newEdge);
};

const addSlackChannelMutation = (slackChannelId, slackChannelName, teamMemberId, viewerId) => {
  return commitMutation(
    relayEnv.get(),
    {
      mutation,
      variables: {
        input: {
          slackChannelId,
          teamMemberId
        }
      },
      updater: (store) => {
        const payload = store.getRootField('addSlackChannel');
        const newEdge = payload.getLinkedRecord('newChannel');
        const [, teamId] = teamMemberId.split('::');
        sharedUpdater(store, viewerId, teamId, newEdge);
      },
      optimisticUpdater: (store) => {
        const id = `client:newChannel:${tempId++}`;
        const node = store.create(id, 'Provider');
        node.setValue(slackChannelId, 'channelId');
        node.setValue(slackChannelName, 'channelName');
        const newEdge = store.create(
          'client:newEdge:' + tempId++,
          'SlackIntegrationEdge'
        );
        newEdge.setLinkedRecord(node, 'node');
        const [, teamId] = teamMemberId.split('::');
        sharedUpdater(store, viewerId, teamId, newEdge);

      },
      onError: (err) => {
        console.log('err', err)
      }
    }
  )
};

export default addSlackChannelMutation;