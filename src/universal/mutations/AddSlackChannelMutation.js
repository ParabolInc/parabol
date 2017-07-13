import {commitMutation} from 'react-relay';
import {insertNodeBefore} from 'universal/utils/relay/insertEdge';

const mutation = graphql`
  mutation AddSlackChannelMutation($input: AddSlackChannelInput!) {
    addSlackChannel(input: $input) {
      channel {
        channelId
        channelName
      }
    }
  }
`;

let tempId = 0;

export const addSlackChannelUpdater = (store, viewerId, teamId, newNode) => {
  const viewer = store.get(viewerId);
  const slackChannels = viewer.getLinkedRecords('slackChannels', {teamId});
  const newNodes = insertNodeBefore(slackChannels, newNode, 'channelName');
  viewer.setLinkedRecords(newNodes, 'slackChannels', {teamId});
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
      const node = store.getRootField('addSlackChannel').getLinkedRecord('channel');
      const [, teamId] = teamMemberId.split('::');
      addSlackChannelUpdater(store, viewerId, teamId, node);
    },
    optimisticUpdater: (store) => {
      const id = `client:channel:${tempId++}`;
      const node = store.create(id, 'SlackIntegration');
      node.setValue(slackChannelId, 'channelId');
      node.setValue(slackChannelName, 'channelName');
      const [, teamId] = teamMemberId.split('::');
      addSlackChannelUpdater(store, viewerId, teamId, node);
    },
    onError: (err) => {
      console.log('err', err);
    }
  });
};

export default AddSlackChannelMutation;
