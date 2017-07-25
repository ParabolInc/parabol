import {commitMutation} from 'react-relay';
import {SLACK} from 'universal/utils/constants';
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

export const addSlackChannelUpdater = (store, viewerId, teamId, newSlackIntegration) => {
  const viewer = store.get(viewerId);
  const slackChannels = viewer.getLinkedRecords('slackChannels', {teamId});
  const newNodes = insertNodeBefore(slackChannels, newSlackIntegration, 'channelName');
  viewer.setLinkedRecords(newNodes, 'slackChannels', {teamId});
};

const AddSlackChannelMutation = (environment, payload, teamMemberId, onError, onCompleted) => {
  const {viewerId} = environment;
  const {channelId, channelName} = payload;
  return commitMutation(environment, {
    mutation,
    variables: {
      input: {
        slackChannelId: channelId,
        teamMemberId
      }
    },
    updater: (store) => {
      const slackIntegration = store.getRootField('addSlackChannel').getLinkedRecord('channel');
      const [, teamId] = teamMemberId.split('::');
      addSlackChannelUpdater(store, viewerId, teamId, slackIntegration);
    },
    optimisticUpdater: (store) => {
      const slackIntegration = store.create(`client:channel:${tempId++}`, SLACK)
        .setValue(channelId, 'channelId')
        .setValue(channelName, 'channelName');
      const [, teamId] = teamMemberId.split('::');
      addSlackChannelUpdater(store, viewerId, teamId, slackIntegration);
    },
    onCompleted,
    onError
  });
};

export default AddSlackChannelMutation;
