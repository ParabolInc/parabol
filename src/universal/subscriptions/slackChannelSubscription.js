import relayEnv from 'client/relayEnv';
import {ConnectionHandler} from 'relay-runtime';
//import storeDebugger from 'relay-runtime/lib/RelayStoreProxyDebugger';
import {addSlackChannelUpdater} from 'universal/mutations/addSlackChannelMutation';
import {removeSlackChannelUpdater} from 'universal/mutations/removeSlackChannelMutation';

const subscription = graphql`  
  subscription slackChannelSubscription($teamId: ID!) {
    slackChannelAdded(teamId: $teamId) {
      node {
        id
        channelId
        channelName
      }
    }
    slackChannelRemoved(teamId: $teamId) {
      deletedIntegrationId
    }
  } 
`;

const slackChannelSubscription = (teamId, viewerId) => {
  return relayEnv.ensureSubscription({
    subscription,
    variables: {teamId},
    updater: (store) => {
      const newEdge = store.getRootField('slackChannelAdded');
      if (newEdge) {
        addSlackChannelUpdater(store, viewerId, teamId, newEdge);
      } else {
        const removedChannel = store.getRootField('slackChannelRemoved');
        if (removedChannel) {
          const deletedId = removedChannel.getValue('deletedIntegrationId');
          removeSlackChannelUpdater(store, viewerId, teamId, deletedId);
        }
      }
    }
  })
};

export default slackChannelSubscription;