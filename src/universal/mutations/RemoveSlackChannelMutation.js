import {ConnectionHandler} from 'relay-runtime';
import {commitMutation} from 'react-relay';

const mutation = graphql`
  mutation RemoveSlackChannelMutation($slackGlobalId: ID!) {
    removeSlackChannel(slackGlobalId: $slackGlobalId) {
      deletedId
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
      console.log('err', err)
    }
  })
};

export default RemoveSlackChannelMutation;