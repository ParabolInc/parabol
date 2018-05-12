// import storeDebugger from 'relay-runtime/lib/RelayStoreProxyDebugger';
import {addSlackChannelUpdater} from 'universal/mutations/AddSlackChannelMutation'

const subscription = graphql`
  subscription SlackChannelAddedSubscription($teamId: ID!) {
    slackChannelAdded(teamId: $teamId) {
      channel {
        id
        channelId
        channelName
      }
    }
  }
`

const SlackChannelAddedSubscription = (environment, queryVariables) => {
  const {viewerId} = environment
  const {teamId} = queryVariables
  return {
    subscription,
    variables: {teamId},
    updater: (store) => {
      const payload = store.getRootField('slackChannelAdded')
      if (!payload) return
      const newNode = payload.getLinkedRecord('channel')
      addSlackChannelUpdater(store, viewerId, teamId, newNode)
    }
  }
}

export default SlackChannelAddedSubscription
