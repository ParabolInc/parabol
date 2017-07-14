import {commitMutation} from 'react-relay';

const mutation = graphql`
  mutation RemoveSlackChannelMutation($slackGlobalId: ID!) {
    removeSlackChannel(slackGlobalId: $slackGlobalId) {
      deletedId
    }
  }
`;

export const removeSlackChannelUpdater = (viewer, teamId, deletedId) => {
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
      const viewer = store.get(viewerId);
      const payload = store.getRootField('removeSlackChannel');
      const deletedId = payload.getValue('deletedId');
      removeSlackChannelUpdater(viewer, teamId, deletedId);
    },
    optimisticUpdater: (store) => {
      const viewer = store.get(viewerId);
      removeSlackChannelUpdater(viewer, teamId, slackGlobalId);
    },
    onError: (err) => {
      console.log('err', err);
    }
  });
};

export default RemoveSlackChannelMutation;
