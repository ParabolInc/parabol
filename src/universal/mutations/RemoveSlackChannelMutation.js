import {commitMutation} from 'react-relay';

const mutation = graphql`
  mutation RemoveSlackChannelMutation($slackGlobalId: ID!) {
    removeSlackChannel(slackGlobalId: $slackGlobalId) {
      deletedId
    }
  }
`;

export const removeSlackChannelUpdater = (store, viewerId, teamId, deletedId) => {
  const viewer = store.get(viewerId);
  const slackChannels = viewer.getLinkedRecords('slackChannels', {teamId});
  const idxToDelete = slackChannels.findIndex((channel) => channel.getValue('id') === deletedId);
  if (idxToDelete !== -1) {
    const newNodes = [...slackChannels.slice(0, idxToDelete), ...slackChannels.slice(idxToDelete + 1)];
    viewer.setLinkedRecords(newNodes, 'slackChannels', {teamId});
  }
};

const RemoveSlackChannelMutation = (environment, slackGlobalId, teamId, viewerId) => {
  return commitMutation(environment, {
    mutation,
    variables: {slackGlobalId},
    updater: (store) => {
      const payload = store.getRootField('removeSlackChannel');
      const deletedId = payload.getValue('deletedId');
      removeSlackChannelUpdater(store, viewerId, teamId, deletedId);
    },
    optimisticUpdater: (store) => {
      removeSlackChannelUpdater(store, viewerId, teamId, slackGlobalId);
    },
    onError: (err) => {
      console.log('err', err);
    }
  });
};

export default RemoveSlackChannelMutation;
