import {commitMutation} from 'react-relay';
import {ConnectionHandler} from 'relay-runtime';
import {insertEdgeBefore} from 'universal/utils/relay/insertEdge';
// import storeDebugger from 'relay-runtime/lib/RelayStoreProxyDebugger';

const mutation = graphql`
  mutation AddSlackChannelMutation($input: AddSlackChannelInput!) {
    addSlackChannel(input: $input) {
      cursor
      node {
        channelId
        channelName
      }
    }
  }
`;

let tempId = 0;

export const addSlackChannelUpdater = (store, viewerId, teamId, newEdge) => {
  const conn = ConnectionHandler.getConnection(
    store.get(viewerId),
    'SlackIntegrations_slackChannels',
    {
      teamId
    }
  );
  insertEdgeBefore(conn, newEdge, 'channelName');
};

const AddSlackChannelMutation = (environment, slackChannelId, slackChannelName, teamMemberId, viewerId) => {
  return commitMutation(environment, {
    mutation,
    variables: {
      input: {
        slackChannelId,
        teamMemberId
      }
    },
    updater: (store) => {
      const newEdge = store.getRootField('addSlackChannel');
      const [, teamId] = teamMemberId.split('::');
      addSlackChannelUpdater(store, viewerId, teamId, newEdge);
    },
    optimisticUpdater: (store) => {
      const id = `client:newChannel:${tempId++}`;
      const node = store.create(id, 'Provider');
      node.setValue(slackChannelId, 'channelId');
      node.setValue(slackChannelName, 'channelName');
      const newEdge = store.create(
        `client:newEdge:${tempId++}`,
        'SlackIntegrationEdge'
      );
      newEdge.setLinkedRecord(node, 'node');
      const [, teamId] = teamMemberId.split('::');
      addSlackChannelUpdater(store, viewerId, teamId, newEdge);
    },
    onError: (err) => {
      console.log('err', err);
    }
  });
};

export default AddSlackChannelMutation;
