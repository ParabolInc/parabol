import {commitMutation, graphql} from 'react-relay'
import handleRemoveNotifications from 'universal/mutations/handlers/handleRemoveNotifications'
import getInProxy from 'universal/utils/relay/getInProxy'
import Atmosphere from 'universal/Atmosphere'

graphql`
  fragment ClearNotificationMutation_notification on ClearNotificationPayload {
    notification {
      id
    }
  }
`

const mutation = graphql`
  mutation ClearNotificationMutation($notificationId: ID!) {
    clearNotification(notificationId: $notificationId) {
      error {
        message
      }
      ...ClearNotificationMutation_notification @relay(mask: false)
    }
  }
`

export const clearNotificationNotificationUpdater = (payload, store, viewerId) => {
  const notificationId = getInProxy(payload, 'notification', 'id')
  handleRemoveNotifications(notificationId, store, viewerId)
}

const ClearNotificationMutation = (
  atmosphere: Atmosphere,
  notificationId,
  onError?,
  onCompleted?
) => {
  const {viewerId} = atmosphere
  return commitMutation(atmosphere, {
    mutation,
    variables: {notificationId},
    updater: (store) => {
      const payload = store.getRootField('clearNotification')
      if (!payload) return
      clearNotificationNotificationUpdater(payload, store, viewerId)
    },
    optimisticUpdater: (store) => {
      handleRemoveNotifications(notificationId, store, viewerId)
    },
    onCompleted,
    onError
  })
}

export default ClearNotificationMutation
