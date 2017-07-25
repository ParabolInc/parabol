// import storeDebugger from 'relay-runtime/lib/RelayStoreProxyDebugger';
import {addSlackChannelUpdater} from 'universal/mutations/AddSlackChannelMutation';

const AddedSubscription = graphql`
  subscription SlackChannelAddedSubscription($teamId: ID!) {
    slackChannelAdded(teamId: $teamId) {
      channel {
        id
        channelId
        channelName
      }
    }
  }
`;

const SlackChannelAddedSubscription = (environment, queryVariables) => {
  const {ensureSubscription, viewerId} = environment;
  const {teamId} = queryVariables;
  return ensureSubscription({
    subscription: AddedSubscription,
    variables: {teamId},
    updater: (store) => {
      const newNode = store.getRootField('slackChannelAdded').getLinkedRecord('channel');
      addSlackChannelUpdater(store, viewerId, teamId, newNode);
    }
  });
};

export default SlackChannelAddedSubscription;
