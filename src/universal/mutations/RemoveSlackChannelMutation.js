import {commitMutation} from 'react-relay';
import getArrayWithoutIds from 'universal/utils/relay/getArrayWithoutIds';

const mutation = graphql`
  mutation RemoveSlackChannelMutation($slackGlobalId: ID!) {
    removeSlackChannel(slackGlobalId: $slackGlobalId) {
      deletedId
    }
  }
`;

export const removeSlackChannelUpdater = (viewer, teamId, deletedId) => {
  const slackChannels = viewer.getLinkedRecords('slackChannels', {teamId});
  const newNodes = getArrayWithoutIds(slackChannels, deletedId);
  viewer.setLinkedRecords(newNodes, 'slackChannels', {teamId});
};

const RemoveSlackChannelMutation = (environment, slackGlobalId, teamId) => {
  const {viewerId} = environment;
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
      console.error('err', err);
    }
  });
};

export default RemoveSlackChannelMutation;
