import {commitMutation, graphql} from 'react-relay'
import {Disposable} from 'relay-runtime'
import {LocalHandlers} from '../types/relayMutations'
import {
  SetSlackNotificationMutation,
  SetSlackNotificationMutationVariables
} from '__generated__/SetSlackNotificationMutation.graphql'

graphql`
  fragment SetSlackNotificationMutation_team on SetSlackNotificationPayload {
    user {
      ...SlackProviderRow_viewer
      slackNotifications(teamId: $teamId) {
        channelId
      }
    }
  }
`

const mutation = graphql`
  mutation SetSlackNotificationMutation(
    $slackNotificationEvents: [SlackNotificationEventEnum!]!
    $slackChannelId: ID
    $teamId: ID!
  ) {
    setSlackNotification(
      slackNotificationEvents: $slackNotificationEvents
      slackChannelId: $slackChannelId
      teamId: $teamId
    ) {
      error {
        message
      }
      ...SetSlackNotificationMutation_team @relay(mask: false)
    }
  }
`

const SetSlackNotificationMutation = (
  atmosphere,
  variables: SetSlackNotificationMutationVariables,
  {onError, onCompleted}: LocalHandlers
): Disposable => {
  return commitMutation<SetSlackNotificationMutation>(atmosphere, {
    mutation,
    variables,
    optimisticUpdater: (store) => {
      const {slackNotificationEvents, slackChannelId, teamId} = variables
      const viewer = store.getRoot().getLinkedRecord('viewer')
      if (!viewer) return
      const existingNotifications = viewer.getLinkedRecords('slackNotifications', {teamId})
      if (!existingNotifications) return
      slackNotificationEvents.forEach((event) => {
        const existingNotification = existingNotifications.find(
          (notification) => !!(notification && notification.getValue('event') === event)
        )
        if (existingNotification) {
          existingNotification.setValue(slackChannelId, 'channelId')
        }
      })
    },
    onCompleted,
    onError
  })
}

export default SetSlackNotificationMutation
