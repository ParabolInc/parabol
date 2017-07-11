// import storeDebugger from 'relay-runtime/lib/RelayStoreProxyDebugger';
import {addSlackChannelUpdater} from 'universal/mutations/AddSlackChannelMutation';
import {removeSlackChannelUpdater} from 'universal/mutations/RemoveSlackChannelMutation';
import composeSubs from 'universal/utils/relay/composeSubs';

const AddedSubscription = graphql`
  subscription SlackChannelAddedSubscription($teamId: ID!) {
    slackChannelAdded(teamId: $teamId) {
      id
      channelId
      channelName
    }
  }
`;

const RemovedSubscription = graphql`
  subscription SlackChannelRemovedSubscription($teamId: ID!) {
    slackChannelRemoved(teamId: $teamId) {
      deletedId
    }
  }
`;

const SlackChannel = (teamId, viewerId) => (ensureSubscription) => {
  return composeSubs(
    ensureSubscription({
      subscription: AddedSubscription,
      variables: {teamId},
      updater: (store) => {
        const newNode = store.getRootField('slackChannelAdded');
        addSlackChannelUpdater(store, viewerId, teamId, newNode);
      }
    }),
    ensureSubscription({
      subscription: RemovedSubscription,
      variables: {teamId},
      updater: (store) => {
        const removedChannel = store.getRootField('slackChannelRemoved');
        const deletedId = removedChannel.getValue('deletedId');
        removeSlackChannelUpdater(store, viewerId, teamId, deletedId);
      }
    })
  );
};

export default SlackChannel;
