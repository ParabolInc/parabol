import {commitMutation} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import handleRemoveNotifications from './handlers/handleRemoveNotifications'
import getInProxy from '../utils/relay/getInProxy'
import Atmosphere from '../Atmosphere'

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

export const clearNotificationNotificationUpdater = (payload, store) => {
  const notificationId = getInProxy(payload, 'notification', 'id')
  handleRemoveNotifications(notificationId, store)
}

const ClearNotificationMutation = (
  atmosphere: Atmosphere,
  notificationId,
  onError?,
  onCompleted?
) => {
  return commitMutation(atmosphere, {
    mutation,
    variables: {notificationId},
    updater: (store) => {
      const payload = store.getRootField('clearNotification')
      if (!payload) return
      clearNotificationNotificationUpdater(payload, store)
    },
    optimisticUpdater: (store) => {
      handleRemoveNotifications(notificationId, store)
    },
    onCompleted,
    onError
  })
}

export default ClearNotificationMutation
