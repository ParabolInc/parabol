import {commitMutation} from 'react-relay'
import {SLACK} from 'universal/utils/constants'
import incrementIntegrationCount from 'universal/utils/relay/incrementIntegrationCount'
import {insertNodeBefore} from 'universal/utils/relay/insertEdge'
import fromTeamMemberId from 'universal/utils/relay/fromTeamMemberId'

const mutation = graphql`
  mutation AddSlackChannelMutation($input: AddSlackChannelInput!) {
    addSlackChannel(input: $input) {
      error {
        message
      }
      channel {
        channelId
        channelName
      }
    }
  }
`

let tempId = 0

export const addSlackChannelUpdater = (store, viewerId, teamId, newSlackIntegration) => {
  const viewer = store.get(viewerId)
  const slackChannels = viewer.getLinkedRecords('slackChannels', {teamId})
  if (slackChannels) {
    const newNodes = insertNodeBefore(slackChannels, newSlackIntegration, 'channelName')
    viewer.setLinkedRecords(newNodes, 'slackChannels', {teamId})
  }

  incrementIntegrationCount(viewer, teamId, SLACK, 1)
}

const AddSlackChannelMutation = (
  environment,
  channelPayload,
  teamMemberId,
  onError,
  onCompleted
) => {
  const {viewerId} = environment
  const {channelId, channelName} = channelPayload
  return commitMutation(environment, {
    mutation,
    variables: {
      input: {
        slackChannelId: channelId,
        teamMemberId
      }
    },
    updater: (store) => {
      const payload = store.getRoot('addSlackChannel')
      if (!payload) return
      const slackIntegration = payload.getLinkedRecord('channel')
      const {teamId} = fromTeamMemberId(teamMemberId)
      addSlackChannelUpdater(store, viewerId, teamId, slackIntegration)
    },
    optimisticUpdater: (store) => {
      const slackIntegration = store
        .create(`client:channel:${tempId++}`, SLACK)
        .setValue(channelId, 'channelId')
        .setValue(channelName, 'channelName')
      const {teamId} = fromTeamMemberId(teamMemberId)
      addSlackChannelUpdater(store, viewerId, teamId, slackIntegration)
    },
    onCompleted,
    onError
  })
}

export default AddSlackChannelMutation
